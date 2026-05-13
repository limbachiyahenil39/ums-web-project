# In this file we cover Functions and recursion 
# Functions
"""
Block of statements that perform a specific task.
Syntax :def func_name( param1, param2..) :
                    some work
                    return val

func_name( arg1, arg2 ..) #function call

Example : def sum(x,y): # here function define here x,y are parameters 
            s = x+y 
            print(s)
            return s

            sum(2,3) # function call and give argument (2,3) 
            output : 5
We have built in Functions like : print(),len(),type(),range()

Default Parameters
Assigning a default value to parameter, which is used when no argument is passed.
Example :we can make function without parameter and retrun 
        def print_hello():
            print("Hello world")
            print_hello() 
            output = print_hello() # here we not have return value so it return None
            print(output) # None 
            output : None

Function print() :

(function) def print(
    *values: object,
    sep: str | None = " ",
    end: str | None = "\n",
    file: SupportsWrite[str] | None = None,
    flush: Literal[False] = False
) -> None

Function len() :

(function) def len(
    obj: Sized,
    /
) -> int

Function type() :

(class) type
type(object) -> the object's type
type(name, bases, dict, **kwds) -> a new type

Function range():

class range(
    stop: SupportsIndex,
    /
): ...

class range(
    start: SupportsIndex,
    stop: SupportsIndex,
    step: SupportsIndex = 1,
    /
): ...

range(stop) -> range object
range(start, stop[, step]) -> range object


"""
# Recursion 
"""
Recursion : When a function calls itself repeatedly.
Syntax : Similar to def function 
Example : def show(n):
            if(n==0): # base case 
                return
            print(n,end=" ")
            show(n-1)

            show(5)
            output : 1
                     2
                     3
                     4
                     5

We can find Factorial using recursion function 

def factorial(number):
        if(number == 0 or number == 1):
            return 1
        else:
            return number*factorial(number-1)

# Now take input from user
num = int(input("Enter number : "))
print(f"Factorial is {factorial(num)}")

output : Enter number : 5
         Factorial is 120
         
"""