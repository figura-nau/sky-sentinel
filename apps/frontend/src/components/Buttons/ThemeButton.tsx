import { useThemeContext } from "@/providers";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const ThemeButton = ({
  size = "default",
}: {
  size?: "sm" | "default" | "lg";
}) => {
  const { t } = useTranslation();
  const themeContext = useThemeContext();
  const { userTheme, toggleTheme } = themeContext;
  const handleThemeChange = () => {
    if (toggleTheme) toggleTheme();
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        size={size}
        className={cn(
          "data-[size=default]:w-12 cursor-pointer data-[size=default]:h-9 data-[size=lg]:w-14 data-[size=lg]:h-10 data-[size=sm]:w-10 data-[size=sm]:h-7",
          "data-[size=default]:[&_[data-slot=switch-thumb]]:size-7 data-[size=default]:[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[18px]",
          "data-[size=lg]:[&_[data-slot=switch-thumb]]:size-8 data-[size=lg]:[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[22px]",
          "data-[size=sm]:[&_[data-slot=switch-thumb]]:size-5 data-[size=sm]:[&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[18px]",
        )}
        checked={userTheme === "dark"}
        onCheckedChange={handleThemeChange}
        aria-label={t("common.toggleTheme")}
      />
    </div>
  );
};
