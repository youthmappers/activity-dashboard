import duckdb

cursor = duckdb.connect()
cursor.execute("INSTALL azure;")
cursor.execute("LOAD azure;")
cursor.execute("SET azure_storage_connection_string = 'DefaultEndpointsProtocol=https;AccountName=overturemapswestus2;AccountKey=;EndpointSuffix=core.windows.net';")
res = cursor.execute("""
SELECT
  *
FROM read_parquet('azure://release/2024-06-13-beta.0/theme=buildings/type=building/*', filename=true, hive_partitioning=1)
LIMIT 1;
""").fetchall()

print(res)
