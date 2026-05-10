
export default function passwordValidation (password:string) {

const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?/|\\]/

const passwordValObj = {
    minLength: false,
    containsNum: false,
    containsUppercaseLetter: false,
    containsSpecialCharacter: false
}
if((password.length >= 8 )){
    passwordValObj.minLength = true
}


if((/\d/.test(password))){
    passwordValObj.containsNum = true
}

if((/[A-Z]/.test(password))){
    passwordValObj.containsUppercaseLetter = true
}
if((regex.test(password))){
    passwordValObj.containsSpecialCharacter = true
}


return passwordValObj

}