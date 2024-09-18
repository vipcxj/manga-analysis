import { Document } from 'mongodb';
export interface CompletionPropertyInfo {
    name: string;
    friend?: string;
    friendNoSkip?: boolean;
    desc?: string;
    snippet?: string;
}

export interface CompletionUserPipelineInfo {
    name: string;
    pipeline: Document[];
    friend?: string;
    friendNoSkip?: boolean;
    desc?: string;
    snippet?: string;
}

export const properties: CompletionPropertyInfo[] = [
    {
        name: 'artists',
    },
    {
        name: 'categories',
    },
    {
        name: 'characters',
    },
    {
        name: 'groups',
    },
    {
        name: 'languages',
    },
    {
        name: 'tags',
    },
    {
        name: 'title_english',
    },
    {
        name: 'title_japanese',
    },
    {
        name: 'title_pretty',
    },
];

export const userPipelines: CompletionUserPipelineInfo[] = [
    {
        name: 'good_mangas',
        pipeline: [
            {
                '$match': {
                    '$expr': {
                        '$not': {
                            '$in': [
                                'rough translation', '$tags'
                            ]
                        }
                    }
                }
            }, {
                '$set': {
                    'languages': {
                        '$filter': {
                            'input': '$languages',
                            'as': 'item',
                            'cond': {
                                '$not': {
                                    '$eq': [
                                        '$$item', 'translated'
                                    ]
                                }
                            }
                        }
                    }
                }
            }, {
                '$match': {
                    '$expr': {
                        '$eq': [
                            {
                                '$size': '$languages'
                            }, 1
                        ]
                    }
                }
            }, {
                '$set': {
                    'language': {
                        '$arrayElemAt': [
                            '$languages', 0
                        ]
                    }
                }
            }, {
                '$group': {
                    '_id': '$title_pretty',
                    'languages': {
                        '$addToSet': '$language'
                    },
                    'docs': {
                        '$push': '$$ROOT'
                    }
                }
            }, {
                '$match': {
                    '$expr': {
                        '$and': [
                            {
                                '$in': [
                                    'chinese', '$languages'
                                ]
                            }, {
                                '$in': [
                                    'japanese', '$languages'
                                ]
                            }
                        ]
                    }
                }
            }, {
                '$unwind': {
                    'path': '$docs',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$group': {
                    '_id': {
                        'title': '$docs.title_pretty',
                        'language': '$docs.language'
                    },
                    'docs': {
                        '$push': '$docs'
                    }
                }
            }, {
                '$set': {
                    'doc': {
                        '$arrayElemAt': [
                            {
                                '$sortArray': {
                                    'input': '$docs',
                                    'sortBy': {
                                        'num_favorites': -1
                                    }
                                }
                            }, 0
                        ]
                    }
                }
            }, {
                '$replaceWith': '$doc'
            }, {
                '$sort': {
                    'title_pretty': 1,
                    'language': 1
                }
            }
        ],
    }
];

export function getPipeline(userPipelineName: string): Document[] {
    const userPipeline = userPipelines.find(c => c.name === userPipelineName);
    return userPipeline?.pipeline || [];
}