#In this file we cover List , Tuples and its application !
# List
"""
List : A built-in data type that stores set of values
It can store elements of different types (integer, float, string, etc.)
Notice : List is Mutable 

Syntax  : list = []
Example : list = [29,56,49,25,49] : print(list) : print(type(list)) : output : [29, 56, 49, 25, 49] <class 'list'>
list have unique index 
String  list = ["harsh","raj","chaman","bot"]
like    list = [1,23,54,69] : print(list[2]) : output : 54

"""
# List and its Operation 
"""
0.Lenght of List
Syntax : len(list)
Example : list = [1,2,3,5,9,6,46,69] : print(len(list)) : output : 8

1. Slicing 
Similar to String operation here
The actual Slicing Synatx : list[starting_idx : Ending_idx : step]

a.Normal Slicing
Syntax  : list[starting_idx : ending_idx*] (*here ending index is optional) :
Example : list = [1,2,3,5,9,6,46,69] : print(list[0:5]) : output : [1, 2, 3, 5, 9] 
also can write print(list[0:len(list) ])               : output : [1, 2, 3, 5, 9, 6, 46, 69]

b.Negative Slicing 
Syntax : list[starting_idx : ending_idx*] (*here ending index is optional) :
list = [1,2,3,5,9,6,46,69] : print(list[-5 :-2]) : output : [5, 9, 6]
also can write print(list[-1])                   : output : 69

To write List in reverse so print(list[::-1]) : output : [69, 46, 6, 9, 5, 3, 2, 1]

2.Append()
add new element in existing list at the end
Notice : give None if we write print(list.append())
Syntax  : list.append()
Example : list = [1,2,3,5,9,6,46,69] ; list.append(67) : print(list) : output : [1, 2, 3, 5, 9, 6, 46, 69, 67]

3.Sort()
This function sort the list in ascending order 
Notice : give None if we write print(list.sort())

a.Normal sorting
Syntax  : list.sort()
Example : list = [1,2,3,5,9,6,46,69] : list.sort()             : print(list) : output : [1, 2, 3, 5, 6, 9, 46, 69]

b.Reverse Sorting
sortng in descending order
Syntax : list.sort(reverse=True)
Example: list = [1,2,3,5,9,6,46,69] : list.sort(reverse=True) : print(list)  : output : [69, 46, 9, 6, 5, 3, 2, 1]

c.Reverse()
This is in-built python function for list reverse
Syntax : list.reverse()
Example : list = [1,2,3,5,9,6,46,69] : list.reverse()         : print(list)  : output : [69, 46, 9, 6, 5, 3, 2, 1]

4.insert()
Insert element between two elements 
Notice : give None if we write print(list.insert())
Syntax  : list.insert(index,element)
Example : list = [1,2,3,5,9,6,46,69] : list.insert(2,56)      : print(list)  : output : [1, 2, 56, 3, 5, 9, 6, 46, 69]

5.remove()
Python will remove that element from list 
Notice : give None if we write print(list.append())
Syntax : list.remove()
Example : list = [1,2,3,5,9,6,46,69] : list.remove(46)        : print(list)  : output : [1, 2, 3, 5, 9, 6, 69]

6.Pop()
Python will remove element from List using index number
Notice : give None if we write print(list.append())
Syntax : list.pop()
Example : list = [1,2,3,5,9,6,46,69] : list.pop(1)            : print(list)  : output : [1, 3, 5, 9, 6, 46, 69]

"""
# Tuples
"""
A built-in data type that lets us create immutable sequences of values.
Notice : Tuple is immutable 
Syntax  : tuples = ()
Example : tuples = (12,56,46,59,69,45) :  print(tuples) : print(type(tuple)) : output : (12, 56, 46, 59, 69, 45) <class 'tuple'>
Tuple  have unique index 
String  tuple = ("harsh","raj","chaman","bot")
like    tuple = (1,23,54,69) : print(tuple[2]) : output : 54
Also for single element in tuple we write in tuple = (1,) , because tuple =(1) makes it integer data type 

"""
# Tuple and its Operation 
"""
0.Lenght of Tuple
Syntax : len(tuple)
Example : tuple = (1,2,3,5,9,6,46,69)       : print(len(tuple)) : output : 8

1.Indexing
Similar to list the tuple also support indexing 
Here from element we can find its postion from index number
Syntax : tuples.index(element)
Example : tuples = (12,56,46,59,69,45)      : print(tuples.index(56)) : output : 1

2.Count()
Python can count number of occurrences of number using count function
Syntax : tuples.count(element)
Example : tuples = (12,12,56,25,56,12,12,69) :print(tuples.count(12)) : output : 4

3. Slicing 
Similar to String operation here
The actual Slicing Synatx : tuple[starting_idx : Ending_idx : step]

a.Normal Slicing
Syntax  : tuple[starting_idx : ending_idx*] (*here ending index is optional) :
Example : tuple = (1,2,3,5,9,6,46,69) : print(tuple[0:5]) : output : (1, 2, 3, 5, 9) 
also can write print(tuple[0:len(tuple) ])                : output : (1, 2, 3, 5, 9, 6, 46, 69)

b.Negative Slicing 
Syntax : tuple[starting_idx : ending_idx*] (*here ending index is optional) :
tuple = (1,2,3,5,9,6,46,69): print(tuple[-5 :-2]) : output : [5, 9, 6]
also can write print(tuple[-1])                   : output : 69

To write tuple in reverse so print(tuple[::-1])   : output : (69, 46, 6, 9, 5, 3, 2, 1)

"""
