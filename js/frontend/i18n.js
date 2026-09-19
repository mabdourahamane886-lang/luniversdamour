window.LuniversI18n = {
  lang: localStorage.getItem("luniversLang") || "fr",
  dict: {
    fr: { start: "Commencer une conversation" },
    en: { start: "Start a conversation" },
    ar: { start: "ابدأ محادثة" },
    ha: { start: "Fara tattaunawa" }
  },
  set(lang) {
    this.lang = this.dict[lang] ? lang : "fr";
    localStorage.setItem("luniversLang", this.lang);
    document.documentElement.lang = this.lang === "ar" ? "ar" : this.lang;
    document.documentElement.dir = this.lang === "ar" ? "rtl" : "ltr";
  }
};
