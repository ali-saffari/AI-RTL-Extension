// Modal and donation functions
export function modalDonateFun() {
    const modal = document.getElementById('Asmodal');
    const openBtn = document.getElementById('AsopenBtn');
    const closeBtn = document.getElementById('AscloseBtn');


    if (openBtn)
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

    if (closeBtn)
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

}


export function modalDonate() {


    return `
         
            <div class="As-modal-backdrop FontSet" id="Asmodal">
  <div class="As-modal">
 <h2 style="margin-top:0; color:#e67e22;">💛 ممنون که همراه ما هستی!</h2>
   <p>
اگر از این اکستنشن خوشت اومده، می‌تونی با این سه روش از ما حمایت کنی و مارو برای به‌روزرسانی و اضافه کردن قابلیت‌های جدید دلگرم نگه داری:


</p>



<div class="As-modal-block">
    <h3 style="color:#27ae60;">💸 ۱. حمایت مالی</h3>
    
    
    <p>حمایت مالی شما به ما کمک می‌کنه تا امکانات جدید اضافه کنیم، مشکلات رو سریع‌تر برطرف کنیم و تجربه کاربری بهتری بسازیم. هر مبلغی که دوست داری، واقعاً تاثیرگذار و دلگرم‌کننده است!</p>
    <a href="https://zarinp.al/719522" target="_blank" 
      style="display:inline-block; background:#27ae60; color:#fff; padding:5px 13px; border-radius:5px; text-decoration:none; font-weight:bold;        margin-top: 11px;
">
      حمایت مالی
    </a>
    
<!--    <p><small>هر مبلغی که دوست داری، کمک بزرگیه!</small></p>-->

</div>


<div class="As-modal-block">
    <h3 style="color:#f39c12;">⭐ ۲. دادن ۵ ستاره</h3>
    <p>اگر نمی‌تونی حمایت مالی کنی، اشکالی نداره! فقط با دادن ۵ ستاره به اکستنشن، کلی دلگرمی بهمون می‌دی و نشون می‌دی که کنارمون هستی!</p>
    
       <a href="https://chromewebstore.google.com/detail/rtl-chatgpt-persianfarsi/pjpmebofipgpjaincgoboibbmicccbne" target="_blank" 
      style="display:inline-block; background:#27ae60; color:#fff; padding:5px 13px; border-radius:5px; text-decoration:none; font-weight:bold;       margin-top: 11px;
">
      صفحه رسمی اکستنشن
    </a>
    
    
</div>

<div class="As-modal-block">
    <h3 style="color:#2980b9;">📢 ۳. معرفی به دوستان</h3>
    <p>معرفی این اکستنشن به دوستات، بهترین کمکه که می‌تونه باعث شه ما بیشتر دیده بشیم و بتونیم بهتر و سریع‌تر پیشرفت کنیم. فقط کافیه یه لحظه وقت بذاری و بهشون خبر بدی!
باورت نمی‌شه چقدر این کار کوچک، تاثیر بزرگی داره.</p>
</div>


    <button class="As-close-btn" id="AscloseBtn">بستن</button>
  </div>
</div>

`

}


export function BtnDonate() {

    return `<div class="AsSBtn AsDonate" id="AsopenBtn" style="z-index: 900">دوست داری ازش حمایت کنی ؟</div>`
}