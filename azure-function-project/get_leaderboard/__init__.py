# GetLeaderboard/__init__.py
import json
import logging
import azure.functions as func
from azure.cosmos import CosmosClient, exceptions, PartitionKey
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('GetLeaderboard function processed a request')
    
    # CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",  # In production, restrict to your domain
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Requested-With"
    }
    
    # Handle OPTIONS preflight requests
    if req.method == "OPTIONS":
        return func.HttpResponse(status_code=200, headers=headers)
    
    try:
        # Get Cosmos DB connection details from app settings
        cosmos_endpoint = os.environ["COSMOS_ENDPOINT"]
        cosmos_key = os.environ["COSMOS_KEY"]
        database_id = os.environ.get("COSMOS_DATABASE_ID", "azure_learning_games")
        container_id = os.environ.get("COSMOS_CONTAINER_ID", "game_scores")
        
        # Get query parameters
        game_type = req.params.get('gameType')
        limit = int(req.params.get('limit', 10))
        
        if not game_type:
            return func.HttpResponse(
                json.dumps({"error": "Missing required parameter: gameType"}),
                status_code=400,
                headers=headers
            )
        
        # Create Cosmos DB client
        client = CosmosClient(cosmos_endpoint, cosmos_key)
        database = client.get_database_client(database_id)
        container = database.get_container_client(container_id)
        
        # Query for leaderboard
        query = f"SELECT * FROM c WHERE c.gameType = @gameType ORDER BY c.score DESC OFFSET 0 LIMIT @limit"
        parameters = [
            {"name": "@gameType", "value": game_type},
            {"name": "@limit", "value": limit}
        ]
        
        items = list(container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        return func.HttpResponse(
            json.dumps(items),
            status_code=200,
            mimetype="application/json",
            headers=headers
        )
    
    except Exception as e:
        logging.error(f"Error getting leaderboard: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers=headers
        )