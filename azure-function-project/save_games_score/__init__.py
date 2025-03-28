# SaveScore/__init__.py
import json
import logging
import azure.functions as func
from azure.cosmos import CosmosClient, exceptions
import os
import datetime

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('SaveScore function processed a request')
    
    # CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",  # In production, restrict to your domain
        "Access-Control-Allow-Methods": "POST, OPTIONS",
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
        
        # Parse request body
        req_body = req.get_json()
        nickname = req_body.get('nickname')
        game_type = req_body.get('gameType')
        score = req_body.get('score')
        metadata = req_body.get('metadata', {})
        
        # Validate required fields
        if not nickname or not game_type or score is None:
            return func.HttpResponse(
                json.dumps({"error": "Missing required fields: nickname, gameType, or score"}),
                status_code=400,
                headers=headers
            )
        
        # Create Cosmos DB client
        client = CosmosClient(cosmos_endpoint, cosmos_key)
        database = client.get_database_client(database_id)
        container = database.get_container_client(container_id)
        
        # Create score document
        timestamp = datetime.datetime.utcnow().isoformat()
        score_data = {
            "id": f"{nickname}_{game_type}_{timestamp}",
            "nickname": nickname,
            "gameType": game_type,
            "score": score,
            "timestamp": timestamp,
            **metadata
        }
        
        # Save to Cosmos DB
        created_item = container.create_item(body=score_data)
        
        return func.HttpResponse(
            json.dumps(created_item),
            status_code=201,
            mimetype="application/json",
            headers=headers
        )
    
    except Exception as e:
        logging.error(f"Error saving score: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers=headers
        )