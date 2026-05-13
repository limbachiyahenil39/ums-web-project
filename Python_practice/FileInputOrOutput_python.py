# In this File we cover File input/output in python 
"""
Python can be used to perform operations on a file. (read & write data)

Types of all files
1.Text Files : .txt, .docx, .log etc.
2. Binary Files : .mp4, .mov, .png, .jpeg etc.

Process of Opening and reading file 
Syntax : f = open("file_name.extension","mode"):

example : f = open("file_example.txt","w")
          f.write("Hello World")
          f.close()
         print("Saved Successfully !")

For opening and read file :
f = open("example.txt","r")
reader = f.read() 
f.close()

print(data) #This will read all data at once

We have readline() , this readline at a time 
 Notice : so we have to make multiple var to read enitre data   

For writting in file 
f = open("Example.txt","a")
f.write("This is written about python , python kown for coding language !")
f.close()

Types of operation attempt on file
"r"  : Read mode          : only read file 
"w"  : write mode         : only write in file , but wipout the enitire data from that file (truncate we called)
"a"  : apend mode         : only write in file , but it start from where pointer points , so basically start from where last time data write 
"b"  : binary mode        : data will in binary 
"t"  : text mode(default) : text writing
"r+" : read + overwrite existing file  (pointer at start)
"w+" : read + overwrite (truncate : wipout whole text in and start from new) (pointer kahi ho farh nahi padtha )
"a+" : read + append (pointer at end)

Opening file using with syntax 

with open("hello_world.txt", "r") as f:
    data = f.read()
    print(data)

Deleting file

import os
os.remove(filename)

"""
#CSV operation
"""
CSV stands for Comma seperate value 
import csv

student = [
        ["Name","Age","City"],
        ["Harsh",19,"Vadodara"],
        ["Raj",20,"Surat"]
]
# write in CSV file
with open("CSV_example.csv","w",newline="") as f :
    writer = csv.writer(f)
    writer.writerows(student)

print("Operation is successful !")


# Read CSV file
with open("CSV_example.csv","r") as f :
                                             # data_reader = csv.reader(f)  this shows memory location     
    data_reader = csv.reader(f)
    for i in data_reader:
        print(i)
"""
# JSON operation
"""
JSON stands for java script object notation
import json

student = {
    "name" : "harsh",
    "subject" : {
            "maths" : 83,
            "stat" : 89,
            "python" :69
    }
}

# Write in JSON 
with open("JSON_example.json","w") as f :
    json.dump(student,f,indent=4) # here indent is for 4 ki spacing 

print("Successfully store data !")

# Read in JSON
with open("JSON_example.json","r") as f :
    data_reader = json.load(f)

print(data_reader,end=" ")
"""