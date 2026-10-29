export function validateEmail(email: string): string | undefined {
    if(!email.trim()){
        return "Please enter your email address!";
    }

    //client side check
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return "Please enter a VALID email address!!!";
    }

    return undefined;
}