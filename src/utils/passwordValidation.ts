
export default function passwordValidation (password:string) {

const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?/|\\]/
// Takes a password string and validates it against requirements
// Returns an object with a boolean for each requirement

const passwordValObj = {
    minLength: true,
    containsNum: true,
    containsUppercaseLetter: true,
    containsSpecialCharacter: true
}
// Check minimum 8 characters
if(!(password.length >= 8 )){
    passwordValObj.minLength = false
}

// Check at least one number

if(!(/\d/.test(password))){
    passwordValObj.containsNum = false
}

// Check at least one uppercase letter
if(!(/[A-Z]/.test(password))){
    passwordValObj.containsUppercaseLetter = false
}
// Check at least one special character
if(!(regex.test(password))){
    passwordValObj.containsSpecialCharacter = false
}


// Return the results object
return passwordValObj

}