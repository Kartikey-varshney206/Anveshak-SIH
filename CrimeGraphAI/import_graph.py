import os
import sys
from dotenv import load_dotenv
from databricks import sql
from neo4j import GraphDatabase

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

load_dotenv()

# ============================================================
# DATABRICKS CONFIG
# ============================================================

DATABRICKS_SERVER_HOSTNAME = os.getenv("DATABRICKS_SERVER_HOSTNAME")
DATABRICKS_HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN")

# ============================================================
# NEO4J CONFIG
# ============================================================

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")


# ============================================================
# CHECK ENVIRONMENT VARIABLES
# ============================================================

required = {
    "DATABRICKS_SERVER_HOSTNAME": DATABRICKS_SERVER_HOSTNAME,
    "DATABRICKS_HTTP_PATH": DATABRICKS_HTTP_PATH,
    "DATABRICKS_TOKEN": DATABRICKS_TOKEN,
    "NEO4J_URI": NEO4J_URI,
    "NEO4J_USERNAME": NEO4J_USERNAME,
    "NEO4J_PASSWORD": NEO4J_PASSWORD,
}

missing = [key for key, value in required.items() if not value]

if missing:
    print("❌ Missing environment variables:")
    for item in missing:
        print(f"   - {item}")
    raise SystemExit(1)


# ============================================================
# CONNECT TO NEO4J
# ============================================================

print("🔌 Connecting to Neo4j...")

neo4j_driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
)

try:
    neo4j_driver.verify_connectivity()
    print("✅ Neo4j connection successful!")
except Exception as e:
    print("❌ Neo4j connection failed:")
    print(e)
    neo4j_driver.close()
    raise SystemExit(1)


# ============================================================
# CREATE NEO4J CONSTRAINTS
# ============================================================

def create_constraints(driver):

    queries = [
        "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE",
        "CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE",
        "CREATE CONSTRAINT phone_id_unique IF NOT EXISTS FOR (p:Phone) REQUIRE p.id IS UNIQUE",
        "CREATE CONSTRAINT org_id_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE",
    ]

    with driver.session(database=NEO4J_DATABASE) as session:
        for query in queries:
            try:
                session.run(query)
            except Exception as e:
                print(f"⚠️ Constraint warning ({query.split()[2]}): {e}", flush=True)

    print("✅ Neo4j constraints ready", flush=True)


# ============================================================
# CREATE / MERGE GRAPH DATA
# ============================================================

def create_relationships_batch(
    tx,
    source_label,
    target_label,
    rel_type,
    batch
):
    query = f"""
    UNWIND $batch AS item
    MERGE (source:{source_label} {{id: item.source_id}})
    SET source.entity_type = item.source_type

    MERGE (target:{target_label} {{id: item.target_id}})
    SET target.entity_type = item.target_type

    MERGE (source)-[r:{rel_type} {{
        source_record_id: item.source_record_id
    }}]->(target)

    SET r.case_id = item.case_id,
        r.timestamp = item.timestamp,
        r.confidence = item.confidence,
        r.evidence_source_type = item.evidence_source_type
    """

    tx.run(query, batch=batch)


# ============================================================
# READ DATA FROM DATABRICKS
# ============================================================

def import_from_databricks():

    print("🔌 Connecting to Databricks...", flush=True)

    connection = sql.connect(
        server_hostname=DATABRICKS_SERVER_HOSTNAME,
        http_path=DATABRICKS_HTTP_PATH,
        access_token=DATABRICKS_TOKEN
    )

    print("✅ Databricks connection successful!", flush=True)

    query = """
    SELECT
        source_id,
        source_entity_type,
        target_id,
        target_entity_type,
        relationship_type,
        case_id,
        timestamp,
        confidence,
        evidence_source_type,
        source_record_id
    FROM workspace.default.criminal_network_gold
    """

    cursor = connection.cursor()

    print("📥 Reading criminal_network_gold...", flush=True)

    cursor.execute(query)

    rows = cursor.fetchall()

    print(f"📊 Rows received from Databricks: {len(rows)}", flush=True)

    cursor.close()
    connection.close()

    return rows


# ============================================================
# INSERT INTO NEO4J
# ============================================================

def insert_into_neo4j(rows):

    print("📤 Importing graph into Neo4j...", flush=True)

    label_map = {
        "PERSON": "Person",
        "VEHICLE": "Vehicle",
        "CASE": "Case",
        "LOCATION": "Location",
        "PHONE": "Phone",
        "ORGANIZATION": "Organization"
    }

    allowed_relationships = {
        "CONTACTED",
        "FINANCIAL_LINK",
        "SHARED_LOCATION",
        "OWNS",
        "SHARED_PERSON"
    }

    # Group by (source_label, target_label, rel_type) for high performance batch UNWIND
    from collections import defaultdict
    grouped = defaultdict(list)

    for row in rows:
        (
            source_id,
            source_entity_type,
            target_id,
            target_entity_type,
            relationship_type,
            case_id,
            timestamp,
            confidence,
            evidence_source_type,
            source_record_id
        ) = row

        source_label = label_map.get(str(source_entity_type).upper() if source_entity_type else "", "Entity")
        target_label = label_map.get(str(target_entity_type).upper() if target_entity_type else "", "Entity")

        rel_type = str(relationship_type).upper() if relationship_type else "RELATED_TO"
        if rel_type not in allowed_relationships:
            rel_type = "RELATED_TO"

        item = {
            "source_id": str(source_id) if source_id is not None else "",
            "source_type": str(source_entity_type) if source_entity_type is not None else "",
            "target_id": str(target_id) if target_id is not None else "",
            "target_type": str(target_entity_type) if target_entity_type is not None else "",
            "case_id": str(case_id) if case_id is not None else "",
            "timestamp": str(timestamp) if timestamp is not None else None,
            "confidence": float(confidence) if confidence is not None else None,
            "evidence_source_type": str(evidence_source_type) if evidence_source_type is not None else None,
            "source_record_id": str(source_record_id) if source_record_id is not None else ""
        }

        grouped[(source_label, target_label, rel_type)].append(item)

    total_imported = 0
    with neo4j_driver.session(database=NEO4J_DATABASE) as session:
        for (s_label, t_label, r_type), batch_items in grouped.items():
            # Process in chunks of 200
            chunk_size = 200
            for i in range(0, len(batch_items), chunk_size):
                chunk = batch_items[i:i + chunk_size]
                session.execute_write(
                    create_relationships_batch,
                    s_label,
                    t_label,
                    r_type,
                    chunk
                )
                total_imported += len(chunk)
                print(f"   Imported {total_imported}/{len(rows)} relationships ({s_label} -[:{r_type}]-> {t_label})...", flush=True)

    print(f"✅ Imported {total_imported} relationships into Neo4j successfully!", flush=True)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print("\n========================================", flush=True)
    print("       CrimeGraph AI Graph Import", flush=True)
    print("========================================\n", flush=True)

    create_constraints(neo4j_driver)

    rows = import_from_databricks()

    if not rows:
        print("⚠️ No rows found in criminal_network_gold", flush=True)
    else:
        insert_into_neo4j(rows)

    neo4j_driver.close()

    print("\n🎉 GRAPH IMPORT COMPLETE!", flush=True)
