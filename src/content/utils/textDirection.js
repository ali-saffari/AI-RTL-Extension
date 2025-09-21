// Text direction detection functions
export function isPersian(str) {

    return countWords(str)

}

export function getTextDirection(text) {
    // شمارش کاراکترهای فارسی و عربی
    const rtlChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || [];
    // شمارش کاراکترهای لاتین
    const ltrChars = text.match(/[A-Za-z]/g) || [];

    // اگر تعداد کاراکترهای فارسی بیشتر بود، rtl برگردان
    return rtlChars.length > ltrChars.length ? true : false;
}


export function countChars(str) {
    let rightToLeft = 0;
    let leftToRight = 0;

    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);

        // Check if the character is right-to-left or left-to-right
        if ((charCode >= 0x0590 && charCode <= 0x05FF) || // Hebrew
            (charCode >= 0x0600 && charCode <= 0x06FF) || // Arabic
            (charCode >= 0x0700 && charCode <= 0x08FF) || // Syriac
            (charCode >= 0x08A0 && charCode <= 0x08FF) || // Arabic Extended-A
            (charCode >= 0xFB1D && charCode <= 0xFDFF) || // Hebrew Presentation Forms
            (charCode >= 0xFE70 && charCode <= 0xFEFF)) { // Arabic Presentation Forms
            rightToLeft++;
        } else {
            leftToRight++;
        }
    }


    return {rightToLeft, leftToRight};
}


export function countWords(text) {
    // جدا کردن کلمات از متن


    if (typeof text == "boolean") {
        return false;
    }
    const words = text.split(" ");

    let leftCount = 0;
    let rightCount = 0;

    for (let i = 0; i < words.length; i++) {
        if (i < 5) {

            const word = words[i]
            let a = 1;
            if (i === 0) {
                a = 10
            }
            if (i === 1) {
                a = 7
            }
            if (i > 1 && i > 4) {
                a = 5
            }


            if (word && word !== "") {

                const x = countChars(word);
                if (x.rightToLeft > x.leftToRight) {
                    rightCount += a;
                } else {
                    leftCount += a;
                }
            }
        }
    }


    // console.log({
    //     text ,
    //     rightCount, leftCount
    // })

    if (rightCount > leftCount) {
        return true;
    } else {
        return false;
    }

}




export function isRTL(text) {
    let dir = detectTextDirection(text)


    console.log("ALI")

    // console.log(
    //     text,
    //     dir
    // )

    return dir;
}

export function detectTextDirection(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    // حذف فاصله‌ها و کاراکترهای خاص
    const cleanText = text.replace(/\s+/g, '').replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u0700-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFFA-Za-z]/g, '');
    
    if (cleanText.length === 0) {
        return false;
    }

    // شمارش کاراکترهای RTL
    const rtlChars = cleanText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u0700-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g) || [];
    const ltrChars = cleanText.match(/[A-Za-z]/g) || [];

    return rtlChars.length > ltrChars.length;
}
