from bertopic import BERTopic
from sklearn.datasets import fetch_20newsgroups
from sentence_transformers import SentenceTransformer

docs = fetch_20newsgroups(subset='all')['data']
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
topic_model = BERTopic(embedding_model=sentence_model)
topic_model.fit(docs)

THRESHOLD = 0.8

def get_text_topics(text):
	topics, probs = topic_model.transform(text)
	filtered_topics = set()
	for i, topic in enumerate(topics):
		if i > THRESHOLD:
			filtered_topics.add(topic)
	return filtered_topics

def get_similarity_score(topics1, text2):
	topics2 = get_text_topics(text2)
	count = 0
	for topic in topics1:
		if topic in topics2:
			count += 1
	return count / max(len(topics1), len(topics2))
