# In this File we cover Strings and its application !
"""
String (str) : string is data types that stores data in string form
Notice !! String is immutable 

There are three ways to make string data 
1.Single Quotes ('') : first_name = 'Harshrajsinh'
2.Double Quotes ("") : middle_name = "p"
3.Triple Quotes (""" """) : last_name = """ """ (text under that triple quotes) 

Q-How to print continue sentence in next line ?

For writing sentence on next line we use Escape Sequence Character like "\n" or "\t" here \n stands for next line and  \t stands for tab spaces in sentence  

sentence = "Hello this is a Python Basic String file ,\nthis file extension is .py and py stands for python" 
"""
# Basic Operation On String 
"""
1.Concatenation 
This function adds two string 
str1 = "Harsh" ; Str2 = "raj" : print( str1 + str2 ) : output : Harshraj 

2.Length 
This function count or find the length of String 
Notice : Stirng also counts the space also 
string = "Harshraj" : print( len(string) )      : output : 8

3.Indexing 
String has a unique index or position for all character
str1 = "Harshraj" : print(str1[2])              : output : r

4.Slicing 
String can get slice or else get divide
The actual Slicing Synatx : str[starting_idx : Ending_idx : step]

a.Normal Slicing
Syntax : str[starting_idx : ending_idx*] (*here ending index is optional) :
str1 = "Harshraj" : print(str1[0:5])            : output : Harsh
also can write print(str1[ 0:len(str1) ])       : output : Harshraj

b.Negative Slicing 
Syntax : str[starting_idx : ending_idx*] (*here ending index is optional) :
str1 = "Harshraj" : print(str1[-5:-2])          : output : shr
also can write print(str1[-1])                  : output : Harshra

To write Stirng in reverse so print(str1[::-1]) : output : jarhsraH

5.EndWith("")
This function check whether the String last index ends with this and return boolean value
Syntax : str.endswith("")
str1 = "Harshraj" : print(str1.endsWith("raj")) : output : True

6.Capitalize()
This function make capital the first Character 
Syntax : str.capitalize()
str1 = "harshraj" : print(str1.capitalize())    : output : Harshraj

7.Replace()
This function replace old occourencess of old with new 
Syntax : str.replace(old,new)
str1 = "My name is Harsh " : print(str1.replace("Harsh","Harshraj")) : output : My name is Harshraj

8.Find()
This function find the word in it and gives output in index form
Syntax : str.find(word)
str1 = "My name is Harshraj " : print(str1.find("name")) : output : 3 

9.Count()
This function counts the number of repeation of word or alphabet 
Syntax : str.count()
str1 = "My name is Harshraj " : print(str1.count("a"))   : output : 3

"""