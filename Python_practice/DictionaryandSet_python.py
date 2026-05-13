# In this file we cover Dictinoary and Set and its application 
# Dictinoary
"""
Dictionaries are used to store data values in key:value pairs
They are unordered, mutable(changeable) & don't allow duplicate keys
Syntax : Dictinoary = {
                    "key" : "value";
}

Example info = {
     "key" : "value",
     "name" : "harsh",
     "learing" : "coding",
     "subject" : ["python" ,"C" , "C#" , "java"],
     "topic" : ("dictinary" "set "),
     12 : 69
}

We have nested Dictionary in that we dictionary in dictionary
Syntax dictionary1 = {
                "key" : "value"
                "dictionary2" : {
                    "key1" : "value"
                }
}
Example student = {
    "name" : "harsh",
    "subject" : {
            "maths" : 83,
            "stat" : 89,
            "python" :69
    }
}
we can print also print(student["subject"]["python"]) : output : 69 #here only value will print only 

"""
# Dictionary application 
"""
1. Keys()
This function return all keys 
Syntax : dictionary.keys()
Example : student = {
                        "name" : "harsh",
                        "subject" : {
                                    "maths" : 83,
                                    "stat" : 89,
                                    "python" :69
                                }
                        }
    print(student.keys()) : output :  dict_keys(['name', 'subject'])  

2. Values()
This function return all values of dictionary 
Syntax  : dictionary.values()
Example : student = {
                        "name" : "harsh",
                        "subject" : {
                                "maths" : 83,
                                "stat" : 89,
                                "python" :69
                            }
                    }            
    print(student.values()) : output : dict_values(['harsh', {'maths': 83, 'stat': 89, 'python': 69}])

3. Items()
This function return item in tuples form 
Syntax  : dictionry.items()
Example : student = {
                        "name" : "harsh",
                        "subject" : {
                                "maths" : 83,
                                "stat" : 89,
                                "python" :69
                            }
                    }            
    print(student.items()) : output : dict_items([('name', 'harsh'), ('subject', {'maths': 83, 'stat': 89, 'python': 69})])

Notice : dict get returns the key according to value it will return none when not found and using direct print(student["name"]) not found return error

4. Get()
This function return key value 
Syntax : dictionary.get("key")
Example : student = {
                        "name" : "harsh",
                        "subject" : {
                                "maths" : 83,
                                "stat" : 89,
                                "python" :69
                            }
                    }            
    print(student.get("name")) : output : harsh

5. Update()
This function update the dictionary by inserting keys and values 
Syntax : dictionary.update("key":"value")
Example : student = {
                        "name" : "harsh",
                        "subject" : {
                                "maths" : 83,
                                "stat" : 89,
                                "python" :69
                            }
                    }            
    student.update( {"city" : "vadodara"} ) print(student) : output : {'name': 'harsh', 'subject': {'maths': 83, 'stat': 89, 'python': 69}, 'city': 'vaododara'}
6. Type casting 
In that we can type cast into list or in tuples 
for keys , values we have differnet function  

a. For keys list
Syntax : print(list(student.keys()))
student = {
    "name" : "harsh",
    "subject" : {
            "maths" : 83,
            "stat" : 89,
            "python" :69
    }
}
  print(list(student.keys())) : output : ['name', 'subject']

b. For values list
Syntax : print(list(student.values()))
student = {
    "name" : "harsh",
    "subject" : {
            "maths" : 83,
            "stat" : 89,
            "python" :69
    }
}
        print(list(student.values())) : output : ['harsh', {'maths': 83, 'stat': 89, 'python': 69}]

c,d Similar for tuples 
The values retrun in tuples form 
for keys Syntax : print(tuple(student.keys())) 
for values Syntax : print(tuple(student.values()))

""" 
# Set
"""
Set is the collection of the unordered items.
Each element in the set must be unique & immutable.
Syntax  : set = {}
Example : set = {1,2,3,6,5,9}

Notice :  set is mutable but its elements is inmutalbe 
collection = {1,2,3,4 ,2,2,2, "hello world"}
print(collection) :print(type(collection)) : print(len(collection)) : output : {1, 2, 3, 4, 'hello world'}
<class 'set'> 5 

Notice : total number of elements duplicates not count ,
 to print empty set so collection = set() this is syntax for this 
"""
# Set application 
""" 
We are defining collection as a set for every set application 
collection = {1,2,3,4 ,2,2,2, "hello world"}

1. Add()
This function add element in set
Syntax  : set.add(elemnet)
Example : collection.add("python") : print(collection)    : output : {1, 2, 3, 4, 'python', 'hello world'}
2. Remove()
This function remove element from set 
Syntax  : set.remove(element)
Example : collection.remove("python") : print(collection) : output : {1, 2, 3, 4, 'hello world'}

3. Clear()
This function clear whole set 
Using this , empty set will create 
Syntax  : set.clear()
Example : collection1 = {1,2,3,4,"hello world"} : collection1.clear() : print(collection1) : output : set()

4. Pop()
This function shows or pop out the random values
Syntax : set.pop()
Example : collection1 = {1,2,3,4,"hello world"} :  print(collection1.pop()) : output : 1

5. Union()
This follows a set property call union , in which all element all combine in to one into another set , duplicate value not come 
Syntax  : set1.union(set2)
Example : set1 = {1,2,3,4} : set2 = {5,6,7,8} : print(set1.union(set2)) : output : {1, 2, 3, 4, 5, 6, 7, 8}

6. Intersection()
This also set property , in which intersection , the common value came in new set 
Syntax  : set = se1.intersection(set2)
Example : set3 = {2,4,5} : set4 = {2,5,3} : inter_set = set3.intersection(set4) : print(inter_set) : output : {2, 5}

"""
