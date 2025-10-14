export const isInstagram = () => {
  const ua = navigator.userAgent || window.opera;
  return ua.toLowerCase().indexOf("instagram") > -1 ? true : false;
};
