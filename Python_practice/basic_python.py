# In this file we cover basic python stuffs ! 
"""
 The below code is our first code using printf function to print Hello World !! 
print("Hello World !!")
"""

# define variables or can say identifiers !
"""
 we can use semicolon to make seperate the function , here use in below 

name = "Harsh"; print(name)     output : Harsh
age = 19   ; print(age)         output : 19
height = 175.5 ; print(height)  output : 175.5

"""
# Data Types 
"""
We have different data types like Integer (int) , Float (float) , String (string) , Boolean (boolean) , Complex (complex) ,None (None)
We explain using example 
for to show data types we use type function to show data types such as , print(types(var)) 
If we write direct like  , print(type(int)) : output must be <class 'type'>

1. Integer : integer_var = 10    ; print(type(integer_var)) : output : <class 'int'>
2. String : string_var = "Harsh" ; print(type(string_var))  : output : <class 'str'>
3. Float : float_var = 67.69     ; print(type(flaot_var))   : output : <class 'float'>
4. Boolean : boolean_var = True  ; print(type(boolean_var)) : output : <class 'bool'>
5. Complex : complex_var = 3+5j  ; print(type(complex_var)) : output : <class 'complex'>
6. None: none_var = None         ; print(type(none_var))    : output : <class 'NoneType'>

Here this are bsaic data types futher we cover more data types in next python program :)

"""
# Comments in Python 
"""
In python we add comments to make code easier to read like we can see that above we use too much comments to make user easy to read

For single line comment we hash symbol "#" 
for multiple line comments we use (""" """) and (''' ''') we can use single and double qoutes for comments 
to quickly comments too many lines of code then , we select that multiples line and : 'ctrl + / ' -  to make comments 

"""
# Types of Operators
"""
An operator is a symbol that performs a certain operation between operands.
We have 4 types of Operators : we are covering below 

1. Arithmatic Operators 
a. Addition       : print(1 + 1) : output : 2 
b. Subtraction    : print(1 - 1) : output : 0
c. Multiplication : print(1 * 1) : output : 1 
d. Divison        : print(4 / 2) : output : 2
e. Modulus        : print(4 % 2) : output : 0
f. Power function : print(4 * 2) : output : 16

2. Relational / Comparison Operator 
Notice : Output will came in Boolean data type like True , False

a. double Equal to : Check whether value is equal to or not and but the value must me same    : print(4 == 2) : output : False
b. Not equal to               : It is inverse of "==" Operator                                : print(4 != 2) : output : True
c. Greater than               : check wether number is greater than other number              : print(4 > 2)  : output : True
d. Lesser than                : check wether number is Lesser than other number               : print(4 < 2)  : output : False
e. Greater than and Equal to  :  check wether number is greater than or equal to other number : print(4 >= 2) : output : True
f. Lesser than and Equal to   :  check wether number is lesser than or equal to other number  : print(4 <= 2) : output : False

3. Assignment Operators : this operator assign work to variable
Note : below all operator must have to deifine variable before using operator

a.Equal to(=)               : assign value to variable : variable = 69                    : print(variable) : output : 69
b.Plus equal (+=)           : assign addition to variable x = x+1       : x = 1 ; x += 1  : print(x)        :  output :2 
c.Subtraction equal (-=)    : assign subtraction to variable x = x-1    : x = 2 ; x -=1   : print(x)        : output : 1
d.Multiplication equal (*=) : assign multiplication to variable x = x*2 : x = 2 ; x *=2   : print(x)        : output : 4
e.Divide equal (/=)         : assign division to variable x = x/2       : x = 4 ; x /=2   : print(x)        : output : 2
f.Modulo equal (%=)         : assign modulus to variable x = x%2        : x = 4 ; x %=2   : print(x)        : output : 0
g.Power equal (**=)         : assign power to variable  x = x**2        : x = 2 ; x **=2  : print(x)        : output : 4 

4. Logical Operators 
Notice : This operators perform boolean data types with Relation Operator 

a.Not (not) : perform != condtion with inverse output                        : a,b = 2,5 ; print(not(b>a)) : output : False
b.And (and) : perform A*B if one condition is false so output will be false  : print((5>2) and (2>5))      : output : False
c.Or  (or)  : perform A+B if one is true so output will be true              : print((5>2) or (2>5))       : output : True

"""
# Conversion 
"""
We have two types of Conversion 
1.Implicit Conversion (Type Conversion)(Automatic)
The python can do automatically , mean it auto convert the data types
Suppose : a,b = 25,69.69 #one is int and other is float ; c = a+b : print(c) ; print(type(c)) : output : 94.69 <class 'float'>

2.Explicit Conversion (Type Casting)(Manual)
The User will decide to convert the data type  most time we use for from String to integer or float data types
Suppose : a = "6000" ; a = int(a)                                 : print(a) ; print(type(a)) : output : 6000 <class 'int'>

"""
# Input in Python 
"""
In python we can take user input using input function 
Using direct input function python convert all value in string form 
Syntax : input("Any text here !")
example : a = input("Enter number : ") ; print(a) : output : Enter number :25 25
we can take input in Integer , Float , String , etc 
example : print("Information about your self ")
          name   = str(input("Enter your Name :     "))
          age    = int(input("Enter your age  :      "))
          weight = float(input("Enter your weight(kg) : "))
          print(f"Your Name is {name} , your Age is {age} and Weight is {weight}. Nice to Meet you :) ")

Output : Information about your self
         Enter your name : Harshraj
         Enter your age  : 19
         Enter your weight(kg) : 60.58 
         Your Name is Harshraj , your Age is 19 and Weight is 60.58. Nice to Meet you :)

"""
