// ================= AUTO DETECT LANGUAGE (FIRST TIME ONLY) =================

(function(){

  if(!localStorage.getItem("lang")){

    const userLang = navigator.language || navigator.userLanguage;

    if(userLang.includes("te")){
      localStorage.setItem("lang", "te");
    } 
    else if(userLang.includes("hi")){
      localStorage.setItem("lang", "hi");
    } 
    else{
      localStorage.setItem("lang", "en");
    }

  }

})();


// ================= INIT GOOGLE TRANSLATE =================

function googleTranslateElementInit() {

  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,te,hi',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');

  applySavedLanguage();
}


// ================= APPLY SAVED LANGUAGE =================

function applySavedLanguage(){

  const savedLang = localStorage.getItem("lang");

  if(!savedLang) return;

  let applied = false;

  const interval = setInterval(() => {

    const combo = document.querySelector(".goog-te-combo");

    if(combo && !applied){

      combo.value = savedLang;
      combo.dispatchEvent(new Event("change"));

      applied = true;
      clearInterval(interval);

      // Show page after translation applied
      document.body.style.opacity = "1";
    }

  }, 300);

}


// ================= SAVE LANGUAGE ON CHANGE =================

document.addEventListener("change", function(e){

  if(e.target.className === "goog-te-combo"){

    const selectedLang = e.target.value;
    localStorage.setItem("lang", selectedLang);

  }

});
