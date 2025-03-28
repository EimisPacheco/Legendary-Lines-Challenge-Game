import logging
import azure.functions as func
import json
import os
from openai import AzureOpenAI, OpenAIError

# Azure OpenAI configuration
AZURE_ENDPOINT = os.environ["AZURE_OPENAI_ENDPOINT"]
AZURE_API_KEY = os.environ["AZURE_REMOVED_SECRET"]
AZURE_API_VERSION = os.environ.get("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")

# Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=AZURE_ENDPOINT,
    api_key=AZURE_API_KEY,
    api_version=AZURE_API_VERSION
)

AI_PERSONALITY_PROMPT = """You are an enthusiastic, witty, and super encouraging game show host for 'Legendary Lines'! 🎮 
... (keep the same full prompt as you already have)
"""

def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=204,
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, x-functions-key'
            }
        )

    try:
        body = req.get_json()
        action = req.params.get("action", "").lower()

        if action == "check":
            return check_answer(body)
        else:
            return generate_phrase(body)

    except Exception as e:
        logging.error(f"🔥 Unhandled error: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={'Access-Control-Allow-Origin': '*'}
        )


def generate_phrase(body):
    try:
        category = body.get('category', 'QUOTE')
        difficulty = body.get('difficulty', 'MEDIUM')
        difficulty_config = body.get('difficultyConfig', {"popularity": "moderately known", "description": "somewhat challenging phrases"})
        conversation_history = body.get('conversationHistory', [])

        system_message = {
            "role": "system",
            "content": f"{AI_PERSONALITY_PROMPT}\nYou are a game master for 'Legendary Lines'. Generate {difficulty_config['popularity']} content for the {category} category. Focus on {difficulty_config['description']}."
        }

        user_message = {
            "role": "user",
            "content": f"Generate a {difficulty.lower()} difficulty {category.lower()} phrase."
        }

        messages = [system_message]

        if conversation_history:
            messages.append({
                "role": "system",
                "content": f"Previous game history: {json.dumps(conversation_history)}"
            })

        messages.append(user_message)

        completion = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            functions=[{
                "name": "generatePhrase",
                "description": "Generate a phrase or quote for the game based on category and difficulty",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "phrase": {"type": "string"},
                        "source": {"type": "string"},
                        "year": {"type": "number"},
                        "hint": {"type": "string"},
                        "additionalInfo": {
                            "type": "object",
                            "properties": {
                                "creator": {"type": "string"},
                                "genre": {"type": "string"}
                            }
                        }
                    },
                    "required": ["phrase", "source", "year", "hint"]
                }
            }],
            function_call={"name": "generatePhrase"}
        )

        args = completion.choices[0].message.function_call.arguments
        return func.HttpResponse(
            args,
            status_code=200,
            mimetype="application/json",
            headers={'Access-Control-Allow-Origin': '*'}
        )

    except Exception as e:
        logging.error(f"❌ Error in generate_phrase: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={'Access-Control-Allow-Origin': '*'}
        )


def check_answer(body):
    try:
        player_answer = body.get('playerAnswer')
        correct_answer = body.get('correctAnswer')
        answer_type = body.get('answerType', 'source')
        conversation_history = body.get('conversationHistory', [])

        messages = [
            {
                "role": "system",
                "content": f"""{AI_PERSONALITY_PROMPT}

VALIDATION RULES:
1. For bonus confirmation questions (yes/no):
   - Accept variations: "yes", "yeah", "sure", "y", "ok"
   - Accept variations: "no", "nope", "pass", "skip", "n"

2. For source/creator answers:
   - Ignore case sensitivity
   - Accept common variations and abbreviations
   - Be flexible with minor typos

3. For year answers:
   - Must be exact match

Previous context: {json.dumps(conversation_history)}"""
            },
            {
                "role": "user",
                "content": f"""Question type: {answer_type}
Player's answer: "{player_answer}"
Correct answer: "{correct_answer}"
Context: {"Bonus confirmation" if "bonus_confirmation" in answer_type else "Answer attempt"}"""
            }
        ]

        completion = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            functions=[{
                "name": "validateAnswer",
                "description": "Validate player's answer and return the exact formatted response",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "isCorrect": {"type": "boolean"},
                        "feedback": {"type": "string"},
                        "isBonusResponse": {"type": "boolean"},
                        "bonusDeclined": {"type": "boolean"}
                    },
                    "required": ["isCorrect", "feedback", "isBonusResponse"]
                }
            }],
            function_call={"name": "validateAnswer"}
        )

        args = completion.choices[0].message.function_call.arguments
        return func.HttpResponse(
            args,
            status_code=200,
            mimetype="application/json",
            headers={'Access-Control-Allow-Origin': '*'}
        )

    except Exception as e:
        logging.error(f"❌ Error in check_answer: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={'Access-Control-Allow-Origin': '*'}
        )