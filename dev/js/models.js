var MODELS = {
    single_shot:'{"until":10,"seed":1234,"version":"1.1","udo":[["A","INT"]],"udoName":"NAME","objects":[ {"x":300,"y":150,"type":"source","name":"source_1","out":"sink_1","model":{"params":[11,null],"distribution":"constant","udoFields": {"A":{"type":"INT","distribution":"random","params":[null,null],"boolBase":0}}}}, {"x":500,"y":150,"type":"sink","name":"sink_1","model":null}]}',
    plus_one:'{"until":1,"seed":1429935601902,"version":"1.1","udo":[["f","INT"]],"use_udo":true,"udoName":"Ping","objects":[{"x":461,"y":122,"type":"sink","name":"sink_1","model":null},{"x":319,"y":122,"type":"func","name":"func_1","out":"sink_1","model":{"fieldToEdit":"f","funcString":"@f+1"}},{"x":208,"y":115,"type":"source","name":"zero","out":"func_1","model":{"params":["123",""],"distribution":"constant","udoFields":{"f":{"type":"INT","distribution":"constant","params":["0",""],"boolBase":0}}}}]}',
    real_numbers:'{"until":28800,"seed":1429997669042,"version":"1.1","udo":[["x","FLOAT"]],"use_udo":true,"udoName":"Ping","objects":[{"x":651,"y":265,"type":"sink","name":"Negatives","model":null},{"x":649,"y":152,"type":"sink","name":"Zero","model":null},{"x":652,"y":67,"type":"sink","name":"Positives","model":null},{"x":513,"y":160,"type":"splitfunc","name":"splitfunc_2","out":["Zero","Negatives"],"model":{"funct":"@x>0","fieldToCheck":"x","prob":0.5}},{"x":430,"y":128,"type":"splitfunc","name":"splitfunc_1","out":["Positives","splitfunc_2"],"model":{"funct":"@x>0","fieldToCheck":"x","prob":0.5}},{"x":327,"y":130,"type":"func","name":"Minus 1/2","out":"splitfunc_1","model":{"fieldToEdit":"x","funcString":"@x+.5"}},{"x":216,"y":132,"type":"source","name":"Real Numbers","out":"Minus 1/2","model":{"params":["1",""],"distribution":"constant","udoFields":{"x":{"type":"FLOAT","distribution":"random","params":["",""],"boolBase":0}}}}]}',
    feedback_loop_increment:'{"until":28800,"seed":1429985457094,"version":"1.1","udo":[["n","INT"]],"use_udo":true,"udoName":"Ping","objects":[{"x":540,"y":231,"type":"sink","name":"n==5","model":null},{"x":468,"y":33,"type":"reverser","name":"Feedback","out":"Measure","model":null},{"x":415,"y":175,"type":"splitfunc","name":"splitfunc_1","out":["Plus 1","n==5"],"model":{"funct":"n>5","fieldToCheck":"n","prob":0.5}},{"x":474,"y":136,"type":"func","name":"Plus 1","out":"Feedback","model":{"fieldToEdit":"n","funcString":"@n+1"}},{"x":327,"y":170,"type":"thermometer","name":"Measure","out":"splitfunc_1","model":null},{"x":247,"y":171,"type":"source","name":"Zero","out":"Measure","model":{"params":["1",""],"distribution":"constant","udoFields":{"n":{"type":"INT","distribution":"constant","params":["0",""],"boolBase":0}}}}]}',
    bank_teller:'{"until":28800,"seed":1429987056913,"version":"1.1","udo":[],"use_udo":false,"udoName":"Ping","objects":[{"x":499,"y":270,"type":"sink","name":"Leaving","model":null},{"x":341,"y":101,"type":"queue","name":"Tellers","out":"Leaving","model":{"nservers":"5","maxqlen":"10","distribution":"gaussian","params":["5","1"]}},{"x":213,"y":108,"type":"source","name":"Customers","out":"Tellers","model":{"params":["5",""],"distribution":"exponential","udoFields":{}}}]}'
}