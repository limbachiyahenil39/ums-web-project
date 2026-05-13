# In this file we cover loops like while() , for() loops with range function 
# While loop
"""
Loops : Loops are use to repeat instruction  

Syntax : variable ;while condtion :
                            statement
                            varaible condition 
Example : #Normal loop ascending loop
            count = 1           # this variable called iterator 
            while count < 6 :
                print(count)
                count +=1       # this loop  process called iteration 
output : 1
         2
         3
         4
         5

#descending loop
Notice :  most important thing >= sign mahi to condition will always false !!! 
count = 5
while count >=1 :
    print(count)
    count -=1  
output :5
        4
        3
        2
        1

Some application :
1. Break Function 
This function make loop stop or close if condition get true
Example : i=0 ; while i <=5:
                    print(i)
                    if(i == 3):
                        break    # this make loop brake 
                    i+=1
output : 1
         2

2. Continue function 
In this  loop will continue but it will skip that element from if condition
Example :  i=0 ;while i <=5:
                    if(i == 3 or i == 4 ):
                         i+=1
                        continue #skip
                    print(i)
                    i +=1 
output : 1
         2
         5

""" 
# For loop
"""
Loops are used used for sequential traversal. For traversing list, string, tuples etc.
For loops are most often use
Syntax : for i in example : 
            print(i) #here example any thing 
Example : list = [1,2,3,4,5] :for i in list:
                                print(i) 
            output : 1
                     2
                     3
                     4
                     5

We using else function in for loop
list = [1,2,3]
for i in list:
    print(i)
else:
    print("The loop is ended")
output :1
        2
        3
        The loop is ended

Some application :
Range Function 
Range functions returns a sequence of numbers, starting from 0 by default, and increments by
1 (by default), and stops before a specified number.
Syntax : range(start?,stop,step?) 
Notice : here ? is optional if we do not provide it  ok !  and stop is complusory 
# step means i+=1 by default 1 

Example : We are print even number using range number 
for i in range(2,10,2):        # range(start,stop,step) here step is i = i+2
    print(i)                   # we got even number 
output :2
        4 
        6 
        8 
        10

Pass statement 
pass is a null statement that does nothing . it is used as a placeholder for future code 
Syntax : pass
for i in range(5):
    pass                        # use for in future work 

"""