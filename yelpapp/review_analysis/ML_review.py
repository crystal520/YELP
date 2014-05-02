import logging
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)


import json
from gensim import corpora, models, similarities
from pprint import pprint
import gensim, bz2






data = []
with open('review_analysis/review.json') as f:
    for line in f:
        data.append(json.loads(line))
        # pprint(json.loads(line)[u'text'])
        documents= [json.loads(line)[u'text']]
        
        # remove common words and tokenize
        stoplist = set('just this with that for not have on me i my it was they at had a of the and to in I you'.split())
        texts = [[word for word in document.lower().split() if word not in stoplist] for document in documents]
        #pprint(texts)
        # remove words that appear only once
        all_tokens = sum(texts, [])
        # remove first junk word 
        del all_tokens[0]
        #pprint(all_tokens)
        tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)
        texts = [[word for word in text if word not in tokens_once] for text in texts]
        # pprint(texts)
        dictionary = corpora.Dictionary(texts)
        dictionary.save('/tmp/deerwester.dict') # store the dictionary, for future reference
        id2word = dictionary
        # print(dictionary)
        print(dictionary.token2id)
        corpus = [dictionary.doc2bow(text) for text in texts]
        corpora.MmCorpus.serialize('/tmp/deerwester.mm', corpus) # store to disk, for later use
        mm = gensim.corpora.MmCorpus('/tmp/deerwester.mm')
        # print(mm)

        # extract 5 LDA topics, using 1 pass and updating once every 1 chunk (10,000 documents)
        if dictionary:
        	#print(mm)
        	lda = gensim.models.ldamodel.LdaModel(corpus=mm, id2word=id2word, num_topics=5, update_every=1, chunksize=10000, passes=1)
