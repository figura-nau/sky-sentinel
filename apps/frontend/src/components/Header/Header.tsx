import { useTranslation } from "react-i18next";
import { ThemeButton } from "../Buttons/ThemeButton";
import { Button } from "../ui";

export default function Header() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "ua" : "en");
  };

  return (
    <header className="w-full text-foreground py-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{t("header.title")}</h1>
      <div className="flex flex-wrap justify-center items-center gap-2">
        <ThemeButton />
        <Button
          onClick={toggleLanguage}
          variant="outline"
          className="px-4 py-2 border rounded transition-colors"
        >
          {i18n.language === "en" ? "UA" : "EN"}
        </Button>
      </div>
    </header>
  );
}
