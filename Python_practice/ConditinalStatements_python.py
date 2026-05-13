# In this file we cover Conditional statments 
"""
Conditional Statement 
1. If condtion :
Check conditiion whether it is true or false 
Syntax : if(condition) :
            Statement

Example : age=24 ; if(age >= 18):
                        print("It is Adult Now ")
Output : It is Adult Now

2.Elif condition (Else-if) :
After if conditon is get false then elif , Check condition whether it is True or False
Syntax : if(condtion_1):
            Statement_1
         elif(Conition_2):
            Statement_2

Example : age=17 ; if(age >=18):
                    print("Now can vote")
                   elif(age <=18):
                   print("Can't vote")
Output : Can't vote

3.Else condition :
After checking if and elif condtion , the else conditon came here and do not check condition just print statement
Syntax : if(condtion_1):
            Statement_1
        elif(condition_2):
            Statement_2
        else:
            Statement_N (here using N for N number of Statement)

Example : age=10 ; if(age >=18):
                        print("Now can vote")
                   elif(age <=18):
                        print("Can't vote")
                    else:
                        print("It is Kid")
Output : It is Kid 

Q-What is Indentation ?
Ans : The term Indentation mean a well-structure of block which make code more good and neat-clean also sees in Conditional statement , Indentation in Python play major role 
The actual meaning is "Proper Spacing" 


"""
# Nested Statement
"""
In Nested , condition are write in nested form like
Syntax : if condition_1:
            Statement_1
                 if condition2:
                        statement_2

Example : age = 20 :citizen = True : if age >= 18:
                                        if citizen == True:
                                            print("Eligible to vote")
Output : Eligible to vote
                                                                    
"""
