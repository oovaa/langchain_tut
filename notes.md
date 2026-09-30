sooooo

### documents

we have documents we wanna store and users to be able to retrive them

the docs ar initially pdfs ok and the types are

1. general
2. private docs

general are shared between two or more users but private are user specific

for the private we can store the document by the user so we can get all of the docs for the user.

so if we have 4 docs from 1 to 4 we want like

doc 1 to be accessed by all
doc 2 to be accessed by finance
doc 3 to be accessed by finance and HR
4 is only for the admin which is a private doc if there is one admin a general if not

so we need to store extra metadata colled role

i fount that i can store metadata field as an array of strings like ['finance','HR'] and use somehting in chromaDb called `$contains` to get chunks with meta

what we want to do store by:

1. user
2. role
3. docuemnt

so we can get by user for private and role for general
