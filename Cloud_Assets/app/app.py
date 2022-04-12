import os
 
import boto3
from boto3.dynamodb.conditions import Key, Attr
from flask import Flask, jsonify, request
from flask_cors import CORS
# from page_similarity.page_similarity import get_text_topics, get_similarity_score

app = Flask(__name__)
CORS(app)

PAGE_TABLE = 'PagesVote'

client = boto3.client('dynamodb')
resource = boto3.resource('dynamodb')

@app.route("/")
def home_page():
    return "CrowdCheck"
 
 
@app.route("/pages", methods=["GET"])
def get_rating(url=None, user_id=None):
    if url is None:
        url = request.args.get('url', None)
    if user_id is None:
        user_id = request.args.get('userID', None)

    table = resource.Table(PAGE_TABLE)
    response = table.scan(TableName=PAGE_TABLE, FilterExpression=Attr('url').eq(url))
    ratings = response['Items']

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        ratings.extend(response['Items'])

    # requires at least one true rating
    if not ratings:
        return jsonify({
            'rating': 0,
            'user_rating': 0
            })

    user_rating = 0
    total = 0
    potential_votes = len(ratings)

    # all_response = table.scan(TableName=PAGE_TABLE)
    # other_pages = {}
    # url_topics = get_text_topics(ratings[0]['text'])
    # for response in all_response:
    #     if response['url'] != url and url not in other_pages:
    #         other_pages[url] = get_similarity_score(url_topics, response['text'])
    #     if response['url'] != url:
    #         total += other_pages[url] * response['vote']
    #         potential_votes += other_pages[url]


    for rating in ratings:
        if rating['userID'] == user_id:
            user_rating = int(rating['vote'])
        total += int(rating['vote'])

    response = jsonify({
        'rating': total / potential_votes,
        'user_rating': user_rating
    })
    return response

@app.route("/pages", methods=["POST"])
def add_rating():
    url = request.json.get('url')
    user_id = request.json.get('userID')
    vote = request.json.get('vote')
    text = request.json.get('text')

    if not user_id or not url:
        return jsonify({'error': 'Please provide userId, url, and vote'}), 400

    resp = client.put_item(
        TableName=PAGE_TABLE,
        Item={
            'id': {'S': url + ' ' + user_id},
            'userID': {'S': user_id},
            'url': {'S': url},
            'vote': {'S': str(vote)},
            'text': {'S': text}
        }
    )
    return get_rating(url, user_id)

