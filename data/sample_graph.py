

import pandas as pd


import collections
import os
import bz2
import csv
import json
import bisect
import numpy as np
import datetime
import pickle
import random
import seaborn as sns


def add_ancestor(ancestors, samples, g):
    for s in samples:
        if s not in g:
            continue
        for n, v in g[s]:
            if n not in ancestors:
                ancestors.add(n)


def sample_layer_nodes(graph_d3, layer_dict, posts, layer_sample=5, initial_samples=None):
    chosen = set()
    ancestors = set()
    if initial_samples:
        for s in initial_samples:
            chosen.add(s)
        add_ancestor(ancestors, chosen, graph_d3)
    yset = list(layer_dict.keys())
    yset.sort(reverse=True)
    max_y = max(yset)
    for y in yset:
        print('ancestor: ', len(ancestors),end=' ')
        print('chosen : ',len(chosen),end=', ')
        print('layer : ', y,end=' ')
        if y == max_y:
            candidates = [(posts[s], s) for s in layer_dict[y]]
        else:
            candidates = [(posts[s], s) for s in layer_dict[y] if s in ancestors]
        if len(candidates) == 0:
            print(y)
            continue
        candidates.sort(reverse=True)
        print("candidates : ", len(candidates))
        #candidates = candidates[:50]
        probs = np.array([v[0] for v in candidates])
        probs = probs / np.sum(probs)
        count = sum([1 if s in chosen else 0 for s in layer_dict[y]])
        if layer_sample > count:
            # if layer_sample - count > len(candidates):
            #     samples = np.random.choice([v[1] for v in candidates],
            #                            size=layer_sample - count, p=probs)
            # else:
            #     samples = np.random.choice([v[1] for v in candidates],
            #                                size=layer_sample - count,replace=False, p=probs)
            samples = [v[1] for v in candidates]
            chosen |= set(samples)
            add_ancestor(ancestors, samples, graph_d3)
    return chosen, ancestors


print('reading submissions')
datafile = pd.read_json('submissions_creator_common_graph_100',lines=True)
datafile['weight'] = datafile['common'].apply(lambda x : len(x)/100)
datafile = datafile.sort_values(['weight'])
print(len(datafile))
datafile_query = datafile.query('weight>=0.04')
datafile_query.reset_index(drop=True,inplace=True)
print(len(datafile_query))
layer = pd.read_csv('./community_graph/layer_year.csv')
post_size = pd.read_csv('./community_graph/size.csv')
post_size_dict = {}
for i in post_size.values:
    post_size_dict[i[0]] = i[1]
layer_dict_1 = {}
for i in layer.values:
    layer_dict_1[i[1]] = i[2]
reverse_dict = {}
for k in layer_dict_1:
    v = layer_dict_1[k]
    if v not in reverse_dict:
        reverse_dict[v] = []
    reverse_dict[v].append(k)
len(reverse_dict),len(layer_dict_1),len(post_size_dict)
print('-----------------')
csv_d3 = datafile_query[["s2","s1",'weight']]
csv_d3.to_csv('data-0.04.csv',index=False)
graph = {}

# for i in csv_d3.values:
#     if(i[0] in graph):
#         temp = graph[i[0]]
#         temp.append((i[1],i[2]))
#         graph[i[0]] = temp
#     else:
#         graph[i[0]] = [(i[1],i[2])]
# ch, an = sample_layer_nodes(graph, reverse_dict, post_size_dict, layer_sample=3)
# print(len(ch))
# print(len(an))
#
# all_nodes = []
# for i in ch:
#     if i not in graph:
#         continue
#     for j in graph[i]:
#         if j[0] not in i:
#             continue
#         all_nodes.append((j[0], i))
# print(len(all_nodes))

