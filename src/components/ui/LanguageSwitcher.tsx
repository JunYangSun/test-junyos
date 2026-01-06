"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 语言切换组件
 * 使用 shadcn/ui Select 组件实现优雅的下拉选择
 */
export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale as Locale });
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] h-8 cursor-pointer">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent position="popper" side="bottom" align="center" sideOffset={4}>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc} className="cursor-pointer">
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

