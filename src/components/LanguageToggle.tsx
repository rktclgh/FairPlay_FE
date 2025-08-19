import { useTranslation } from 'react-i18next';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const { isDark } = useTheme();

  const toggleLanguage = () => {
    console.log('Language toggle clicked, current:', i18n.language);
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    console.log('Changing to:', newLang);
    i18n.changeLanguage(newLang).then(() => {
      console.log('Language changed to:', i18n.language);
    }).catch(err => {
      console.error('Language change failed:', err);
    });
  };

  return (
    <HiOutlineGlobeAlt 
      className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'} cursor-pointer`}
      onClick={toggleLanguage}
      title={t('language.switchTo')}
    />
  );
};

export default LanguageToggle;