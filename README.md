# Authentication-Security

## Level 1
  1. Username, Password is stored on server databse(MongoDB) can't view password on page source
  2. This level can be easily breached if soneone get access to databse
  
## Level 2
  1. Encrypted password is stored in database (mongoose-encryption)
  2. dotenv is used for environment variables so viewer can't view SECRET_KEY, API_KEY, etc
  3. weak encription system Caesar cipher (encryption key)
  
## Level 3
  1. Hash password and store in database
  2. if common can be cracked using dictionary, hash table attack
  3. password must be long 
      e.g. Time to crak password
      123456 : 3sec
      123456123456 : 31 years

## Level 4
  1. salt round : add extra charaters in password and then hash the password then pass the result to next round 
  2. qcrypt is used to do salt round ( 10 salt rounds are use in Level 4)
  3. Even if two users have same password the result of salt + hash password will be different
      e.g. 
        'With just hashing'
        '123456 : e10adc3949ba59abbe56e057f20f883e'
        
        'With salting and hashing'
        '123456 : 07dbb6e6832da0841dd79701200e4b179f1a94a7b3dd26f612817f3c03117434'
        '123456 : 11c150eb6c1b776f390be60a0a5933a2a2f8c0a0ce766ed92fea5bfd9313c8f6'
        
 ## Level 5
  1. Passport is authentication middleware for Node. js. Extremely flexible and modular.
  2. passport passport-local passport-local-mongoose

## Level 6
  1. Use Third Party OAuth2.0
  2. Google OAuth2.0 is used in this level for authorization
