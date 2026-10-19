import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Zap, Wrench, Smartphone, Laptop, Tablet, Watch, Headphones, CheckCircle2, ArrowRight, MessageSquare, ChevronDown, Monitor, Sparkles, ChevronLeft, ChevronRight, Tv, Radio, Calendar, Globe, Battery, Truck, X, Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';

const BENEFIT_CARDS = [
  {
    id: 1,
    boldText: 'Turn to us when accidents happen.',
    text: ' Stay protected through life’s ups, downs and even drops. Get quick, Apple-certified repairs — many issues can be resolved the same day.',
    footnote: '4',
    img: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_01__bqd7po66snxy_large.jpg',
    img2x: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_01__bqd7po66snxy_large_2x.jpg',
    alt: 'Dropped, cracked, broken, fixed'
  },
  {
    id: 2,
    boldText: 'Stay above water with liquid damage coverage.',
    text: ' Liquid damage is covered as part of accidental damage protection. So now you won’t have to stress over spills and splashes.',
    footnote: null,
    img: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_05__c9x7v7q7m6eu_large_2x.jpg',
    fallbackImg: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_02__dn7ujwq39r42_large_2x.jpg',
    alt: 'Stay above water with liquid damage coverage.'
  },
  {
    id: 3,
    boldText: 'Extended coverage, built in.',
    text: ' AppleCare covers battery replacements at no extra charge if the capacity drops below 80%. Plans also include extended warranty coverage.',
    footnote: null,
    img: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_03__cu95l2h1dqaa_large.jpg',
    img2x: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_03__cu95l2h1dqaa_large_2x.jpg',
    alt: 'No charge for replacements - battery & coverage'
  },
  {
    id: 4,
    boldText: 'Connect with an expert at any time.',
    text: ' Get answers to your questions and support for all your hardware and software needs. Contact us via text, the Apple Support app, phone, online or in person at the Apple Store.',
    footnote: '7',
    img: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_06__bh767x04cz42_large_2x.jpg',
    fallbackImg: 'https://www.apple.com/v/applecare/d/images/overview/benefits/benefits_02__dn7ujwq39r42_large_2x.jpg',
    alt: 'Connect with an expert at any time.'
  }
];

const SameDaySvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 47 56" width="47" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h47v56h-47z" fill="none" />
    <path d="m10.8261 37.165c.1159.1105.1739.342.1739.6949v1.2794c0 .353-.058.5844-.1739.695-.116.11-.3409.1656-.6736.1656h-1.2829c-.3478 0-.5797-.0555-.6957-.1656-.1159-.1106-.1739-.342-.1739-.695v-1.2794c0-.3529.058-.5844.1739-.6949.116-.11.3478-.165.6957-.165h1.2829c.3328 0 .5577.055.6736.165zm14.1739-13.3268c0-.3382-.058-.5624-.174-.6729-.116-.11-.3479-.1653-.6958-.1653h-1.2826c-.3334 0-.5583.0553-.6738.1653-.1165.1105-.174.3346-.174.6729v1.3015c0 .3385.0574.5662.174.6838.1155.118.3404.1765.6738.1765h1.2826c.3479 0 .5798-.0586.6958-.1765.116-.1176.174-.3452.174-.6838zm4.8695-.8382c-.3479 0-.5797.0553-.6957.1653-.1159.1105-.174.3346-.174.6729v1.3015c0 .3385.058.5662.174.6838.116.118.3479.1765.6957.1765h1.2609c.3479 0 .5797-.0586.6957-.1765.1159-.1176.1739-.3452.1739-.6838v-1.3015c0-.3382-.058-.5624-.1739-.6729-.116-.11-.3479-.1653-.6957-.1653zm-18.8695 7.8605c0-.3529-.058-.5844-.1739-.695-.1159-.11-.3408-.1655-.6736-.1655h-1.2829c-.3478 0-.5797.0555-.6956.1655-.116.1106-.174.3421-.174.695v1.2794c0 .3382.058.5664.174.6835.1159.1182.3478.1765.6956.1765h1.2829c.3327 0 .5576-.0583.6736-.1765.1159-.1169.1739-.3452.1739-.6835zm-6 13.1395c-1.6569 0-3-1.3431-3-3v-19c0-1.6569 1.3431-3 3-3h30c1.6569 0 3 1.3431 3 3v7.5253c.6848.031 1.3531.1211 2 .2722v-14.7975c0-2.7614-2.2386-5-5-5h-30c-2.7614-0-5 2.2386-5 5v26c0 2.7614 2.2386 5 5 5h22.9883c-.366-.6305-.6714-1.2987-.9077-2zm20-13.1395c0-.3529-.058-.5844-.174-.695-.116-.11-.3479-.1655-.6958-.1655h-1.2826c-.3334 0-.5583.0555-.6738.1655-.1165.1106-.174.3421-.174.695v1.2794c0 .3382.0574.5664.174.6835.1155.1182.3404.1765.6738.1765h1.2826c.3479 0 .5798-.0583.6958-.1765.116-.1169.174-.3452.174-.6835zm-7.0001 0c0-.3529-.0612-.5844-.1833-.695-.1226-.11-.3491-.1655-.6801-.1655h-1.2732c-.3316 0-.5581.0555-.6801.1655-.1226.1106-.1833.3421-.1833.695v1.2794c0 .3382.0607.5664.1833.6835.1221.1182.3486.1765.6801.1765h1.2732c.3311 0 .5575-.0583.6801-.1765.122-.1169.1833-.3452.1833-.6835zm-.8634 6.1395h-1.2732c-.3316 0-.5581.055-.6801.165-.1226.1106-.1833.3421-.1833.695v1.2794c0 .353.0607.5844.1833.695.1221.11.3486.1656.6801.1656h1.2732c.3311 0 .5575-.0556.6801-.1656.122-.1106.1833-.342.1833-.695v-1.2794c0-.3529-.0612-.5844-.1833-.695-.1226-.11-.3491-.165-.6801-.165zm6.9937 0h-1.2826c-.3334 0-.5583.055-.6738.165-.1165.1106-.174.3421-.174.695v1.2794c0 .353.0574.5844.174.695.1155.11.3404.1656.6738.1656h1.2826c.3479 0 .5798-.0556.6958-.1656.116-.1106.174-.342.174-.695v-1.2794c0-.3529-.058-.5844-.174-.695-.116-.11-.3479-.165-.6958-.165zm-6.1303-13.1618c0-.3382-.0612-.5624-.1833-.6729-.1226-.11-.3491-.1653-.6801-.1653h-1.2732c-.3316 0-.5581.0553-.6801.1653-.1226.1105-.1833.3346-.1833.6729v1.3015c0 .3385.0607.5662.1833.6838.1221.1179.3486.1765.6801.1765h1.2732c.3311 0 .5576-.0586.6801-.1765.122-.1176.1833-.3453.1833-.6838zm28.5001 16.6618c0 4.9706-4.0294 9-9 9s-9-4.0294-9-9 4.0294-9 9-9 9 4.0294 9 9zm-7.5001-4.5c0-.5527-.4478-1-1-1s-1 .4473-1 1v3.9932l-2.9937-.0195h-.0063c-.5493 0-.9966.4434-1 .9932-.0034.5527.4409 1.0029.9937 1.0068l4 .0264h.0063c.2642 0 .5176-.1045.7046-.291.189-.1875.2954-.4424.2954-.709v-5z" fill="#FF2D55" />
  </svg>
);

const GlobalSvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 45 56" width="45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h45v56h-45z" fill="none" />
    <path d="m22 44.2592v-7.7086c1.9113.0906 3.7552.4297 5.5007.9996.0932-.6575.3918-1.267.9088-1.7838l2.1487-2.1744c.2252-1.468.3745-2.9994.4161-4.5921h4.2286l.8762-.8663c.5452-.5756 1.1124-.9255 1.645-1.1336h-6.7499c-.0683-2.6184-.3988-5.0957-.9456-7.3418 1.6362-.699 3.1737-1.5835 4.5888-2.625 2.1862 2.709 3.5605 6.0837 3.8124 9.7649.2755-.0527.5334-.0756.7595-.0756h.0309s.011.0002.011.0002c.3431.0037.7631.0587 1.222.2063-.2301-4.2137-1.7861-8.0718-4.2742-11.1566-.4244-.5261-.8704-1.0334-1.3463-1.5125-3.5324-3.5562-8.4243-5.76-13.8327-5.76s-10.3003 2.2039-13.8327 5.76c-.4758.479-.9219.9863-1.3463 1.5125-2.6983 3.3455-4.321 7.595-4.321 12.2275s1.6227 8.8821 4.321 12.2275c.4244.5261.8704 1.0334 1.3462 1.5125 3.2589 3.2808 7.6812 5.3869 12.5923 5.697l1.5422-2.4115c.1867-.3063.4302-.5541.6983-.7663zm11.2491-28.7366c-1.174.8472-2.4326 1.5803-3.7702 2.1736-.843-2.6318-1.9962-4.8367-3.3634-6.4297 2.7181.8328 5.1537 2.312 7.1336 4.2561zm-11.2491-4.8412c2.1359.6851 4.2731 3.4944 5.6149 7.7346-1.7786.5925-3.6624.9407-5.6149 1.0331v-8.7678zm0 10.7931c2.1383-.0913 4.1995-.4763 6.1477-1.1128.4674 1.9893.7616 4.2192.827 6.6382h-6.9747zm-.0001 7.5255h6.9747c-.0654 2.4189-.3596 4.6489-.827 6.6382-1.9482-.6365-4.0094-1.0215-6.1477-1.1128zm-6.1151-17.7335c-1.3672 1.593-2.5204 3.7979-3.3634 6.4297-1.3376-.5933-2.5963-1.3264-3.7702-2.1736 1.9799-1.9441 4.4155-3.4233 7.1336-4.2561zm-2.8593 17.7335h6.9744v5.5254c-2.1382.0913-4.1993.4763-6.1475 1.1128-.4674-1.9893-.7616-4.2192-.827-6.6382zm-5.6426-11.9669c1.4151 1.0415 2.9525 1.9258 4.5887 2.625-.5468 2.2461-.8773 4.7234-.9456 7.3418h-7.4752c.2141-3.7605 1.6056-7.2078 3.8321-9.9668zm-3.8321 11.9668h7.4752c.0683 2.6184.3988 5.0957.9456 7.3418-1.6362.6992-3.1736 1.5835-4.5887 2.625-2.2264-2.759-3.618-6.2063-3.8321-9.9668zm5.2004 11.4773c1.174-.8472 2.4326-1.5803 3.7702-2.1736.843 2.6318 1.9962 4.8367 3.3634 6.4297-2.7181-.8328-5.1537-2.312-7.1336-4.2561zm11.2488 4.8411c-2.1359-.6851-4.2729-3.4944-5.6146-7.7344 1.7785-.5925 3.6622-.9407 5.6146-1.0332zm0-18.3183h-6.9744c.0654-2.4189.3596-4.6489.827-6.6381 1.9481.6365 4.0093 1.0214 6.1474 1.1127zm0-7.5508c-1.9525-.0925-3.8361-.4407-5.6146-1.0331 1.3417-4.2401 3.4787-7.0493 5.6146-7.7344v8.7676zm9.848 20.8985 1.6885 1.6699-5.1768 5.1758-.1113.9844c-.0254.2832-.1738.5059-.4453.668l-3.0059 1.9102c-.124.0488-.2383.0859-.3438.1113-.0212.0051-.0421.0078-.0627.0078-.0806 0-.1559-.0397-.2244-.1191l-1.0391-1.0566c-.1855-.1738-.1982-.3848-.0371-.6309l1.9111-2.9883c.1602-.2715.3896-.4199.6865-.4453l1.002-.1484 5.1582-5.1387zm12.4873-9.4444-1.3545-1.3545c-.5566-.5439-1.1475-.8193-1.7715-.8262-.0067 0-.0132-.0001-.0199-.0001-.6171 0-1.1769.2696-1.6783.8077l-4.917 4.8613c.3584.5938.3027 1.1191-.167 1.5771-.2778.2628-.5746.3943-.8908.3943-.2195 0-.4482-.0634-.6863-.1902l-1.0391 1.0205c-.2354.2354-.3525.4951-.3525.7793s.123.5508.3711.7979l3.2656 3.3213c.2353.2232.4874.3348.7573.3348.0135 0 .027-.0002.0406-.0008.2842-.0137.5498-.1309.7979-.3525l1.0391-1.0576c-.1855-.2598-.2598-.5293-.2227-.8076s.1787-.5342.4268-.7695c.21-.21.4551-.3311.7324-.3623.0446-.0048.089-.0073.1333-.0073.2335 0 .4639.0671.6929.2026l4.8799-4.8613c.5195-.5566.7764-1.1445.7705-1.7627-.0068-.6182-.2764-1.2002-.8076-1.7441zm-6.9209 4.6387c-.0625.0742-.1367.1113-.2227.1113-.0869 0-.1553-.0312-.2041-.0928-.1611-.1611-.167-.3154-.0186-.4639l3.5254-3.5254c.0742-.0615.1582-.0928.25-.0928.0938 0 .1641.0312.2139.0928.0742.0615.1084.1357.1025.2227-.0068.0869-.0352.1611-.084.2227l-3.5625 3.5254zm4.8985-2.1709-3.5254 3.5254c-.0742.0742-.1514.1113-.2324.1113-.0801 0-.1514-.0371-.2129-.1113-.1611-.124-.1611-.2783 0-.4639l3.5254-3.5068c.0615-.0615.1357-.0928.2227-.0928.0859 0 .1543.0312.2041.0928.1357.1729.1416.3213.0186.4453z" fill="#FF2D55" />
  </svg>
);

const ScreensSvgIcon = ({ className }) => (
  <svg width="43" height="56" viewBox="0 0 43 56" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h43v56h-43z" fill="none" />
    <path d="M19.1216 45.4555L20.0826 33.9728L22.8601 43.4899L24.0702 42.2843L21.4086 33.1644L24.401 31.4959L29.4803 33.6691L30.1879 32.9695L30.6319 32.5305L25.3341 30.2639L25.421 24.4756L33.913 17.4285C35.9242 20.0688 37.1985 23.2886 37.4389 26.7962C37.7109 26.7447 37.9656 26.7227 38.1893 26.7227H38.2202L38.2312 26.7229C38.5725 26.7266 38.9898 26.781 39.4457 26.9268C38.8853 16.6595 30.4071 8.50021 19.9999 8.50021C9.23041 8.50021 0.499908 17.2307 0.499908 28.0002C0.499908 38.3508 8.57071 46.7946 18.7592 47.4376L19.9982 45.5002C19.7023 45.5002 19.4139 45.4701 19.1216 45.4555ZM16.2637 22.3008L18.6453 27.4122L13.3053 27.5122L16.2637 22.3008ZM22.2251 19.3425L23.6648 20.4406L21.2958 24.0342L22.2251 19.3425ZM18.4725 35.2274L15.3039 33.4019L18.9077 30.0303L18.4725 35.2274ZM23.8363 30.0928L20.2395 32.0984L20.5384 28.5274L23.9018 25.7363L23.8363 30.0928ZM22.4737 24.9727L29.9544 13.625C31.0556 14.3899 32.056 15.2842 32.9538 16.2751L22.4737 24.9727ZM24.4925 19.185L22.5499 17.7031L23.8875 10.9502C25.595 11.3395 27.2054 11.978 28.6836 12.8274L24.4925 19.185ZM20 10.5C20.8198 10.5 21.6204 10.5764 22.4105 10.686L19.4561 25.6024L13.0851 11.9303C15.208 11.0132 17.5444 10.5 20 10.5ZM11.7345 12.5819L15.4861 20.6321L11.5388 27.5452L2.51441 27.7141C2.62081 21.1742 6.32251 15.495 11.7345 12.5819ZM2.56141 29.2138L17.8918 28.9268L11.2123 35.1758L9.00981 41.5999C5.34011 38.6286 2.90651 34.2062 2.56141 29.2138ZM12.5101 36.0156L14.1591 34.4728L18.2981 36.8574L18.3423 36.7808L17.6273 45.3198C14.9361 44.9525 12.433 43.9878 10.2736 42.5384L12.5101 36.0156ZM41.3353 30.9033L39.9808 29.5488C39.4242 29.0049 38.8333 28.7295 38.2093 28.7225C38.2026 28.7225 38.1961 28.7225 38.1894 28.7225C37.5723 28.7225 37.0125 28.9921 36.5111 29.5302L31.5941 34.3915C31.9525 34.9853 31.8968 35.5106 31.4271 35.9686C31.1493 36.2314 30.8525 36.3629 30.5363 36.3629C30.3168 36.3629 30.0881 36.2995 29.85 36.1727L28.8109 37.1932C28.5755 37.4286 28.4584 37.6883 28.4584 37.9725C28.4584 38.2567 28.5814 38.5233 28.8295 38.7704L32.0951 42.0917C32.3304 42.3149 32.5825 42.4265 32.8524 42.4265C32.8659 42.4265 32.8794 42.4263 32.893 42.4257C33.1772 42.412 33.4428 42.2948 33.6909 42.0732L34.73 41.0156C34.5445 40.7558 34.4702 40.4863 34.5073 40.208C34.5444 39.9297 34.686 39.6738 34.9341 39.4385C35.1441 39.2285 35.3892 39.1074 35.6665 39.0762C35.7111 39.0714 35.7555 39.0689 35.7998 39.0689C36.0333 39.0689 36.2637 39.136 36.4927 39.2715L41.3726 34.4102C41.8921 33.8536 42.149 33.2657 42.1432 32.6475C42.1363 32.0293 41.8665 31.4472 41.3353 30.9033ZM34.4144 35.542C34.3519 35.6162 34.2777 35.6533 34.1917 35.6533C34.1048 35.6533 34.0364 35.6221 33.9876 35.5605C33.8265 35.3994 33.8206 35.2451 33.969 35.0966L37.4944 31.5712C37.5686 31.5097 37.6526 31.4784 37.7444 31.4784C37.8382 31.4784 37.9085 31.5096 37.9583 31.5712C38.0325 31.6327 38.0667 31.7069 38.0608 31.7939C38.054 31.8808 38.0256 31.955 37.9768 32.0166L34.4144 35.542ZM39.3129 33.3711L35.7875 36.8965C35.7133 36.9707 35.6361 37.0078 35.5551 37.0078C35.475 37.0078 35.4037 36.9707 35.3422 36.8965C35.1811 36.7725 35.1811 36.6182 35.3422 36.4326L38.8676 32.9258C38.9291 32.8643 39.0033 32.833 39.0903 32.833C39.1762 32.833 39.2446 32.8642 39.2944 32.9258C39.4301 33.0987 39.4359 33.2471 39.3129 33.3711ZM28.848 40.3477L30.5365 42.0176L25.3597 47.1934L25.2484 48.1778C25.223 48.461 25.0746 48.6837 24.8031 48.8458L21.7972 50.756C21.6732 50.8048 21.5589 50.8419 21.4534 50.8673C21.4322 50.8724 21.4113 50.8751 21.3907 50.8751C21.3101 50.8751 21.2348 50.8354 21.1663 50.756L20.1272 49.6994C19.9417 49.5256 19.929 49.3146 20.0901 49.0685L22.0012 46.0802C22.1614 45.8087 22.3908 45.6603 22.6877 45.6349L23.6897 45.4865L28.848 40.3477Z" fill="#FF2D55" />
  </svg>
);

const AccidentsSvgIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="56" viewBox="0 0 38 56" className={className}>
    <g id="wrench.and.screwdriver_elevated_np">
      <rect id="box_" width="38" height="56" fill="none" />
      <path id="art_" d="M5.8643,15.9016l4.935,4.9488a.7487.7487,0,1,1-1.0574,1.06l-4.935-4.9488a.7487.7487,0,0,1,1.0574-1.06ZM23.0464,28.4964a63.3949,63.3949,0,0,0-8.4812,11.2279,22.0812,22.0812,0,0,1-3.5325,4.8737l-.0112.0109-.0195.02c-5.6934,5.8987-14.7437-3.0713-8.8438-8.8621l.001-.0012c3.4416-3.2715,5.9807-3.7653,10.0686-6.9336a90.614,90.614,0,0,0,9.6714-8.6062c-.0733-.1958-.1416-.3933-.2-.596a7.8191,7.8191,0,0,1,.2564-5.2924c.041-.1031.083-.2052.1279-.3062l.0041-.0085a8.1935,8.1935,0,0,1,5.2488-4.5421,7.84,7.84,0,0,1,6.1865.7181c-.038.0286-2.4353,2.418-2.47,2.4526l-1.4617,1.4638a1.0186,1.0186,0,0,0,0,1.4356L31.36,17.3224a1.01,1.01,0,0,0,.7168.296,1.0348,1.0348,0,0,0,.124-.024.9914.9914,0,0,0,.593-.272l1.2276-1.229c.9512-.9554,2.0679-2.0817,2.6836-2.7078a7.8644,7.8644,0,0,1,.7075,6.23,8.1961,8.1961,0,0,1-4.865,5.3611,7.7929,7.7929,0,0,1-5.3979.2129c-.2212-.068-.4366-.149-.6492-.2349C25.29,26.1508,24.1218,27.3133,23.0464,28.4964Zm6.66-17.3265c-.1211-.0046-.2385.0059-.3579.0086a6.1233,6.1233,0,0,0-2.0859.4358c-.0582.0238-.117.0456-.1741.071-.1006.0441-.198.0938-.2957.143-.1323.0682-.2639.1375-.3906.2149q-.0476.0287-.0947.0579a6.4191,6.4191,0,0,0-2.7241,3.6863c-.0135.0517-.0276.1032-.04.1555-.03.1206-.0516.2434-.0738.366-.0219.1272-.0449.2541-.0586.3837-.0044.0364-.0056.0732-.0092.11-.0164.1837-.0281.3689-.0281.5567a6.2067,6.2067,0,0,0,.0774.93c.0188.1155.03.231.0561.3466l.0008.0028a6.1542,6.1542,0,0,0,.8154,2.0034h0a6.23,6.23,0,0,0,1.8022,1.865h0a6.1461,6.1461,0,0,0,1.9678.8618l.0017,0c.168.0444.3364.0713.5049.1.1064.0166.2114.0379.3193.049l.02.0013c.2021.02.4072.0313.6145.0313a6.1527,6.1527,0,0,0,1.0368-.0943c.0886-.0158.1782-.0271.2656-.0468.0606-.0131.1192-.0314.179-.0462a6.4082,6.4082,0,0,0,3.7363-2.7c.0252-.04.0489-.08.073-.12.0752-.1218.1436-.2478.21-.375.0566-.1106.112-.2219.1621-.3362.022-.049.0413-.0992.062-.1489a6.1615,6.1615,0,0,0,.4451-2.1219c.0024-.1166.0132-.2314.0085-.3495l-.105.105.0779-.0779-.0112.0112c-.0237.0236-.07.07-.1389.1389l-.1092.1094-.1955.1958-.4917.4922-.0894.09-.46.461-.01.008a2.7714,2.7714,0,0,1-.7182.5136,2.9033,2.9033,0,0,1-2.44.1695,2.7909,2.7909,0,0,1-1.0964-.6911L28.176,16.9643a2.9859,2.9859,0,0,1-.416-.5309c-.03-.0474-.05-.0974-.0767-.146a2.9975,2.9975,0,0,1-.2106-.4645c-.0152-.0448-.0267-.09-.04-.1349a3.0208,3.0208,0,0,1-.1077-.5432c-.0024-.0266-.0054-.0526-.0073-.0793a3.0244,3.0244,0,0,1,.0171-.6443V14.42c.0131-.0944.0285-.1873.05-.28a2.09,2.09,0,0,1,.1025-.3469c.03-.0806.0659-.158.1025-.2363.0176-.0342.0342-.0682.0535-.1018a2.97,2.97,0,0,1,.533-.7533l.17-.17c.28-.3025.5762-.5877.8536-.8548l.4377-.4384Zm-6.551,14.2937c.4531-.4543.9917-.99,1.5346-1.53a8.215,8.215,0,0,1-1.8127-1.8525,93.1614,93.1614,0,0,1-9.22,8.1828C8.6118,34.0664,6.2441,34.5161,3.553,37.2-.5715,41.3151,6.0105,47.2178,9.59,43.213,13.3564,39.4571,12.71,36.3179,23.1553,25.4636ZM10.8032,27.4058c.501-.3687,1.0313-.7735,1.595-1.2218l-9.6311-9.65c-.8565-.82-.583-1.555.2346-2.4159l2.146-2.1178c1.3845-1.3375,2.2166-.54,2.4893-.2782l9.986,9.8846c.5511-.522.8248-.7779,1.441-1.39L9.0322,10.2935c-1.5549-1.4879-3.5676-1.3743-5.2754.2744-2.144,2.1-5.2321,4.4543-2.3791,7.4Zm24.6323-9.8982ZM12.386,20.01a.755.755,0,0,0,.5286-1.28L7.98,13.781a.7488.7488,0,0,0-1.0573,1.06l4.935,4.9488A.7444.7444,0,0,0,12.386,20.01Zm23.2414-2.6942c-.07.07-.1359.1361-.1919.1921C35.5071,17.4361,35.5742,17.3689,35.6274,17.3155ZM6.4126,38.4452a1.8868,1.8868,0,0,0,.16,3.77A1.8868,1.8868,0,0,0,6.4126,38.4452ZM28.1978,18.7229c-.0215-.02-.0416-.0382-.063-.0587v0C28.1562,18.6848,28.1763,18.7027,28.1978,18.7229Zm6.89,20.3871a1.199,1.199,0,0,0-.6177-.3837l-1.7715-.6058L24.4629,29.909c-.4739.5124-.9253,1.0085-1.3435,1.48l8.5,8.4751,2.083.7121c.4324.5928,1.3467,2.0929,1.8611,2.9927L34.53,44.5767c-.8786-.4927-2.4045-1.4153-3.0324-1.8605l-.6631-2.0817-8.4126-8.4469q-.6961.8059-1.29,1.5342l7.95,7.9828.5682,1.7835a1.1956,1.1956,0,0,0,.405.6418,39.5782,39.5782,0,0,0,4.06,2.4922,1.2316,1.2316,0,0,0,1.4069-.2236L37.3765,44.59a1.2162,1.2162,0,0,0,.2334-1.4432A39.5937,39.5937,0,0,0,35.0879,39.11ZM28.1348,18.6642c-.014-.0146-.0227-.0253-.0362-.04.0135.0142.022.0247.0359.0394Z" fill="#FF2D55" />
    </g>
  </svg>
);

const TheftSvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 40 56" width="40" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h40v56h-40z" fill="none" />
    <path d="m39.6143 27.8926c0 10.8066-8.791 19.5986-19.5977 19.5986s-19.5986-8.792-19.5986-19.5986c0-5.759 2.5121-10.9294 6.4802-14.5186l1.1649 1.9086c-3.3456 3.173-5.4459 7.6464-5.4459 12.61 0 9.5938 7.8057 17.3994 17.3994 17.3994s17.3984-7.8057 17.3984-17.3994c0-4.9739-2.1091-9.4551-5.4665-12.6292l1.1649-1.9084c3.9802 3.5896 6.5008 8.7683 6.5008 14.5376zm-29.2122-8.7781c-2.1657 2.3376-3.5017 5.4547-3.5017 8.8855 0 7.2236 5.876 13.0996 13.0996 13.0996s13.0996-5.876 13.0996-13.0996c0-3.4308-1.336-6.5479-3.5017-8.8855l-1.1921 1.9531c1.5576 1.8853 2.4946 4.3014 2.4946 6.9324 0 6.0107-4.8896 10.9004-10.9004 10.9004s-10.9004-4.8896-10.9004-10.9004c0-2.631.937-5.0471 2.4946-6.9324zm-.8374-5.0989-1.1492-1.8828c.5521-.4075 1.1239-.7871 1.7179-1.136.0408-.0239.0802-.05.1212-.0737 2.8782-1.6624 6.2061-2.6292 9.762-2.6292 3.5458 0 6.8652.9608 9.7377 2.6145.041.0237.0804.0498.1213.0737.5944.3479 1.1664.7268 1.7189 1.1334l-1.1492 1.8827-2.2967 3.7627-1.1536 1.8899-2.2816 3.738c.4946.5054.9042 1.0916 1.2172 1.734.4243.871.6691 1.8447.6691 2.8771 0 3.5889-2.8793 6.5107-6.4489 6.592-.0506.0011-.0999.0076-.1507.0076s-.1001-.0065-.1507-.0076c-3.5696-.0813-6.4489-3.0032-6.4489-6.592 0-1.0323.2449-2.0061.6691-2.8771.3128-.6422.7224-1.2281 1.2167-1.7335l-2.2816-3.738-1.1536-1.89-2.2863-3.7457zm7.5084 8.0779c.8834-.4395 1.8749-.6931 2.9269-.6931s2.0436.2537 2.9269.6931l2.2488-3.6841c-1.5407-.8347-3.3036-1.3098-5.1757-1.3098s-3.635.4751-5.1757 1.3098zm6.4318 3.2751c-.4213-.5596-.9689-1.0125-1.6051-1.3199-.0428-.0206-.0812-.0485-.1248-.0679-.5441-.2413-1.1426-.3812-1.775-.3812s-1.2308.1399-1.775.3812c-.0436.0194-.082.0472-.1248.0679-.6365.3076-1.1842.7607-1.6056 1.3206-.4932.6552-.7996 1.4476-.8629 2.3131-.0078.1067-.0322.2089-.0322.3176 0 1.8243 1.1175 3.3923 2.7031 4.0582.5228.2196 1.0958.3422 1.6973.3422s1.1745-.1226 1.6973-.3422c1.5856-.6659 2.7031-2.2339 2.7031-4.0582 0-.1088-.0244-.2109-.0322-.3176-.0632-.8657-.3698-1.6584-.8633-2.3137zm-12.106-12.571 2.2803 3.7358c1.8757-1.0381 4.0293-1.6331 6.3209-1.6331s4.4451.595 6.3209 1.6331l2.2892-3.7504c-2.5382-1.4496-5.4671-2.2899-8.5934-2.2899-3.1364 0-6.0738.8462-8.6177 2.3044zm9.7745 12.4412c-.0444-.0188-.0935-.0276-.1391-.0444-.3236-.1194-.6691-.1943-1.0342-.1943s-.7106.075-1.0342.1943c-.0456.0168-.0947.0256-.1391.0444-.6688.2847-1.204.8101-1.5194 1.4619-.1909.3945-.3073.8315-.3073 1.2993 0 1.6569 1.3431 3 3 3s3-1.3431 3-3c0-.468-.1165-.9055-.3077-1.3003-.3155-.6514-.8505-1.1764-1.519-1.4609z" fill="#FF2D55" />
  </svg>
);

const BatterySvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 47 56" width="47" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h47v56h-47z" fill="none" />
    <path d="m15.7018 39.8153c.0477.0688.1104.1213.1632.1847h-8.8604c-3.8593 0-7-3.1406-7-7v-10c0-3.8594 3.1406-7 7-7h14.7263c-.0363.0394-.0781.0689-.113.1105l-.0183.0219-.0177.0223-1.464 1.8453h-13.1133c-2.7568 0-5 2.2432-5 5v10c0 2.7568 2.2432 5 5 5h8.2253c-.0767.855.2358 1.4791.4718 1.8153zm19.3029-23.8153h-9.0142c.0591.0716.1284.1321.1809.2104.2263.3337.5255.9503.4486 1.7896h8.3846c2.7568 0 5 2.2432 5 5v10c0 2.7568-2.2432 5-5 5h-13.2772l-1.4612 1.8443-.0168.0212-.0173.0208c-.0358.0428-.0786.0732-.1158.1137h14.8884c3.8594 0 7-3.1406 7-7v-10c0-3.8594-3.1406-7-7-7zm8.4954 8.5v7c1.0635-.0717 2.5-1.4373 2.5-3.5071 0-2.0556-1.4365-3.4354-2.5-3.4929zm-15.9319 2.9073c.1823-.2059.2745-.4169.2745-.6341 0-.2059-.0728-.374-.2183-.504-.1455-.1301-.3217-.1946-.5265-.1946h-5.4869l2.4396-6.5746.4904-1.3217c.0245-.0656.0199-.1174.0345-.1783.0632-.2616.0597-.4916-.0592-.6669-.1454-.2172-.3534-.3278-.6228-.3329-.006-.0001-.0118-.0002-.0178-.0002-.2626 0-.5045.1332-.7269.3976l-.4779.6024-1.1901 1.5-7.2006 9.0762c-.1843.2172-.2755.4343-.2755.6505 0 .2059.0728.3739.2183.504.1454.1291.3217.1946.5265.1946h5.4868l-2.4393 6.5746-.4905 1.3217c-.0244.0656-.0192.1174-.0337.1783-.0619.2616-.0566.4915.0664.6669.1506.2172.3586.3278.6229.3329.0059.0001.0116.0002.0175.0002.2577 0 .4977-.1332.7191-.3977l.4772-.6023 1.1885-1.5 7.2039-9.0927z" fill="#FF2D55" />
  </svg>
);

const MailInSvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 51 56" width="51" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h51v56h-51z" fill="none" />
    <path d="m38.3015 23.0884-7.082 4.0444-16.5981-9.4789c.3474-.3612.7451-.6786 1.198-.9264l5.5901-3.0591 16.8921 9.4199zm10.5854-3.7418-16.6675 9.5179.0002 18.0251c.4829-.0986.9558-.2605 1.3999-.5034l13-7.1138c1.603-.8772 2.5999-2.5591 2.5999-4.3862v-13.7725c0-.6151-.1216-1.2102-.3325-1.7672zm-35.3347-.0004c-.2112.5571-.3328 1.1523-.3328 1.7676v3.8862h3.9998c1.6543 0 3 1.3457 3 3 0 .771-.3005 1.468-.7803 2h.2803c1.6543 0 3 1.3457 3 3s-1.3457 3-3 3h-6.364c.3154 1.376 1.1948 2.5779 2.4641 3.2725l13 7.1138c.4441.2432.9172.4048 1.4004.5037l-.0002-18.0254-16.6672-9.5183zm34.2656-1.692c-.3474-.3613-.7454-.6788-1.1982-.9266l-13-7.1138c-1.4954-.8184-3.3049-.8184-4.8003 0l-5.3381 2.9211 16.8484 9.3955 7.4883-4.2762zm-29.5986 10.3458c0-.5527-.4478-1-1-1h-15c-.5522 0-1 .4473-1 1s.4478 1 1 1h15c.5522 0 1-.4473 1-1zm2.5 5c0-.5527-.4478-1-1-1h-15c-.5522 0-1 .4473-1 1s.4478 1 1 1h15c.5522 0 1-.4473 1-1z" fill="#FF2D55" />
  </svg>
);

const AccessoriesSvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 30 56" width="30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h30v56h-30z" fill="none" />
    <path d="m2.0571 39.2422 1.7148 1.7443-2.6079 1.4505c-.1218.0734-.2436.0828-.3647.0273-.1218-.0547-.2095-.1406-.2646-.2571-.0543-.1164-.045-.2477.0279-.3946l1.4944-2.5705zm1.2772-2.2584 22.8649-22.933c.3771-.3672.8326-.5508 1.368-.5508.5346 0 .9909.1836 1.368.5508.3763.3797.5649.8387.5649 1.3771 0 .5387-.1885.9977-.5649 1.3771l-22.8665 22.9329-.9839.5325-2.3161-2.3135z" fill="#FF2D55" />
  </svg>
);

const OnsiteSvgIcon = ({ className }) => (
  <svg height="56" viewBox="0 0 40 56" width="40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m0 0h40v56h-40z" fill="none" />
    <path d="m33.7886 14.2114c-7.6152-7.6152-19.9619-7.6152-27.5772 0s-7.6152 19.9619 0 27.5772 19.9619 7.6152 27.5772 0 7.6152-19.9619 0-27.5772zm-1.5556 1.5556c6.7453 6.7453 6.7453 17.7206 0 24.4659s-17.7206 6.7453-24.4659 0-6.7453-17.7206 0-24.4659 17.7206-6.7453 24.4659 0m-5.1797 4.1596c-.2392.0001-.5133.0691-.8251.2136l-17.2016 7.9987c-.4135.1863-.7336.3311-.9511.5586-.3929.3929-.4659 1.0544-.0628 1.4469.2686.2685.6819.4027 1.126.4024l7.9477.0471c.124 0 .2067.0206.248.0619.0519.0516.072.124.0719.2583l.0368 7.9474c-.0003.4444.1341.8577.4027 1.1263.1857.1809.4263.2651.6702.265.2853-.0002.5752-.116.7868-.3278.2174-.2172.3723-.548.5592-.9511l7.9984-17.2016c.3104-.7029.2694-1.199-.0818-1.5502-.1931-.1931-.4331-.2955-.7251-.2953z" fill="#FF2D55" />
  </svg>
);

const getDeviceLabel = (category) => {
  if (category === 'Watch') return 'Apple Watch';
  if (category === 'TV') return 'Apple TV';
  if (category === 'AirPods') return 'Headphone';
  return category || 'iPhone';
};

const getRepairItems = (category) => {
  const label = getDeviceLabel(category);

  if (category === 'Mac') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'onsite',
        icon: <OnsiteSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Onsite</span> service</>,
        text: 'We’ll send a technician to you or have a courier pick up your Mac desktop for service.',
        fee: null
      },
      {
        id: 'screens',
        icon: <ScreensSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for damaged <span className="text-[#FF2D55]">screens or external enclosures</span></>,
        text: 'Damaged screens or external enclosures can be repaired as many times as you need for a low fee.',
        fee: '₹5290–₹8900 service fee'
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">other accidental damage</span></>,
        text: 'Other accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹15900–₹25900 service fee'
      },
      {
        id: 'battery',
        icon: <BatterySvgIcon className="h-12 w-auto" />,
        title: <>Replacement <span className="text-[#FF2D55]">battery</span> service</>,
        text: 'If your Mac battery holds less than 80% of the original capacity, it’s covered.',
        fee: 'No additional fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your device when service is completed.',
        fee: null
      }
    ];
  }

  if (category === 'Display') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'onsite',
        icon: <OnsiteSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Onsite</span> service</>,
        text: 'We’ll send a technician to you or have a courier pick up your display for service.',
        fee: null
      },
      {
        id: 'screens',
        icon: <ScreensSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for damaged <span className="text-[#FF2D55]">screens or external enclosures</span></>,
        text: 'Damaged screens or external enclosures can be repaired as many times as you need for a low fee.',
        fee: '₹8900 service fee'
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">other accidental damage</span></>,
        text: 'Other accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹25900 service fee'
      }
    ];
  }

  if (category === 'iPad') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'screens',
        icon: <ScreensSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for damaged <span className="text-[#FF2D55]">screens</span></>,
        text: 'Damaged screens can be repaired as often as you need for a low fee — often in the same day.',
        fee: '₹2500 service fee'
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">other accidental damage</span></>,
        text: 'Other accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹8900 service fee'
      },
      {
        id: 'accessories',
        icon: <AccessoriesSvgIcon className="h-12 w-auto" />,
        title: <>Replacements for iPad <span className="text-[#FF2D55]">accessories</span></>,
        text: 'Damaged iPad accessories like Apple Pencil or an Apple-branded keyboard can be replaced for a small fee.',
        fee: '₹2500 service fee'
      },
      {
        id: 'battery',
        icon: <BatterySvgIcon className="h-12 w-auto" />,
        title: <>Replacement <span className="text-[#FF2D55]">battery</span> service</>,
        text: 'If your iPad battery holds less than 80% of the original capacity, it’s covered.',
        fee: 'No additional fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your iPad when service is completed.',
        fee: null
      }
    ];
  }

  if (category === 'Watch') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">accidental damage</span></>,
        text: 'Accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: 'Starting at ₹5900'
      },
      {
        id: 'battery',
        icon: <BatterySvgIcon className="h-12 w-auto" />,
        title: <>Replacement <span className="text-[#FF2D55]">battery</span> service</>,
        text: 'If your Apple Watch battery holds less than 80% of the original capacity, it’s covered.',
        fee: 'No additional fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your Apple Watch when service is completed.',
        fee: null
      }
    ];
  }

  if (category === 'AirPods' || category === 'Headphones') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">accidental damage</span></>,
        text: 'Accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹2500 service fee'
      },
      {
        id: 'battery',
        icon: <BatterySvgIcon className="h-12 w-auto" />,
        title: <>Replacement <span className="text-[#FF2D55]">battery</span> service</>,
        text: 'If your battery holds less than 80% of the original capacity, it’s covered.',
        fee: 'No additional fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your headphones when service is completed.',
        fee: null
      }
    ];
  }

  if (category === 'TV') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">accidental damage</span></>,
        text: 'Accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹1290 service fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your Apple TV when service is completed.',
        fee: null
      }
    ];
  }

  if (category === 'HomePod') {
    return [
      {
        id: 'global',
        icon: <GlobalSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
        text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
        fee: null
      },
      {
        id: 'accidents',
        icon: <AccidentsSvgIcon className="h-12 w-auto" />,
        title: <>Repairs for <span className="text-[#FF2D55]">accidental damage</span></>,
        text: 'Accidents like liquid damage are covered, anytime you need, with a flat fee.',
        fee: '₹1290 service fee'
      },
      {
        id: 'mail-in',
        icon: <MailInSvgIcon className="h-12 w-auto" />,
        title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
        text: 'Schedule a pickup at your home or office. We’ll return your HomePod when service is completed.',
        fee: null
      }
    ];
  }

  return [
    {
      id: 'same-day-service',
      icon: <SameDaySvgIcon className="h-12 w-auto" />,
      title: <><span className="text-[#FF2D55]">Same-day </span> service</>,
      text: 'Get repairs as soon as the same day at the Apple Store or with an Apple Authorised Service Provider.',
      fee: null
    },
    {
      id: 'global',
      icon: <GlobalSvgIcon className="h-12 w-auto" />,
      title: <><span className="text-[#FF2D55]">Global repair</span> access</>,
      text: 'Service and support is close by — visit an Apple Store or one of the more than 5,000 Apple Authorised Service Providers worldwide.',
      fee: null
    },
    {
      id: 'screens',
      icon: <ScreensSvgIcon className="h-12 w-auto" />,
      title: <>Repairs for damaged <span className="text-[#FF2D55]">screens or back glass</span></>,
      text: 'Damaged displays, back glass or Ceramic Shield can be repaired as often as you need for a low fee — often in the same day.⁶',
      fee: '₹2500 service fee'
    },
    {
      id: 'accidents',
      icon: <AccidentsSvgIcon className="h-12 w-auto" />,
      title: <>Repairs for <span className="text-[#FF2D55]">other accidental damage</span></>,
      text: 'Other accidents like liquid damage are covered, anytime you need, with a flat fee.',
      fee: '₹8900 service fee'
    },
    {
      id: 'theft',
      icon: <TheftSvgIcon className="h-12 w-auto" />,
      title: <>Replacement devices for <span className="text-[#FF2D55]">theft and loss</span></>,
      text: `AppleCare+ with theft and loss coverage lets you replace your ${label} up to twice a year.⁵`,
      fee: '₹15900 service fee'
    },
    {
      id: 'battery',
      icon: <BatterySvgIcon className="h-12 w-auto" />,
      title: <>Replacement <span className="text-[#FF2D55]">battery</span> service</>,
      text: `If your ${label} battery holds less than 80% of the original capacity, it’s covered.`,
      fee: 'No additional fee'
    },
    {
      id: 'mail-in',
      icon: <MailInSvgIcon className="h-12 w-auto" />,
      title: <><span className="text-[#FF2D55]">Pickup</span> and delivery service</>,
      text: `Schedule a pickup at your home or office. We’ll return your ${label} when service is completed.`,
      fee: null
    }
  ];
};

const IPhoneSvgIcon = ({ className }) => (
  <svg viewBox="0 0 22 56" className={className} fill="currentColor">
    <path d="m0 0h22v56h-22z" fill="none" />
    <path d="m17.75 10h-13.5c-2.3472 0-4.25 1.9028-4.25 4.25v27.5c0 2.3472 1.9028 4.25 4.25 4.25h13.5c2.3472 0 4.25-1.9028 4.25-4.25v-27.5c0-2.3472-1.9028-4.25-4.25-4.25zm2.25 31.75c0 1.2407-1.0093 2.25-2.25 2.25h-13.5c-1.2407 0-2.25-1.0093-2.25-2.25v-27.5c0-1.2407 1.0093-2.25 2.25-2.25h13.5c1.2407 0 2.25 1.0093 2.25 2.25zm-11.9996-27c0-.5522.4473-1 1-1h4c.5527 0 1 .4478 1 1s-.4473 1-1 1h-4c-.5527 0-1-.4478-1-1zm7.3746 27c0 .4141-.3359.75-.75.75h-7.25c-.4141 0-.75-.3359-.75-.75s.3359-.75.75-.75h7.25c.4141 0 .75.3359.75.75z" />
  </svg>
);

const MacSvgIcon = ({ className }) => (
  <svg viewBox="0 0 54 56" className={className} fill="currentColor">
    <g id="b">
      <rect id="c" width="54" height="56" fill="none" />
      <path id="d" d="M51.5,40h-4.5V17c0-2.2092-1.7908-4-4-4H11c-2.2092,0-4,1.7908-4,4v23H2.5c-.8286,0-1.5,.6714-1.5,1.5s.6714,1.5,1.5,1.5H51.5c.8286,0,1.5-.6714,1.5-1.5s-.6714-1.5-1.5-1.5ZM9,17c0-1.1028,.8972-2,2-2H43c1.1028,0,2,.8972,2,2v23H9V17Z" />
    </g>
  </svg>
);

const DisplaySvgIcon = ({ className }) => (
  <svg viewBox="0 0 42 56" className={className} fill="currentColor">
    <path d="m0 0h42v56h-42z" fill="none" />
    <path d="m40 36.5a1.5 1.5 0 0 1 -1.5 1.5h-35a1.5 1.5 0 0 1 -1.5-1.5v-23a1.5 1.5 0 0 1 1.5-1.5h35a1.5 1.5 0 0 1 1.5 1.5zm-1-26.5h-36a3 3 0 0 0 -3 3v24a3 3 0 0 0 3 3h13v4h-.25a1 1 0 0 0 0 2h10.5a1 1 0 0 0 0-2h-.25v-4h13a3 3 0 0 0 3-3v-24a3 3 0 0 0 -3-3z" />
  </svg>
);

const IPadSvgIcon = ({ className }) => (
  <svg viewBox="0 0 30 56" className={className} fill="currentColor">
    <path d="m0 0h30v56h-30z" fill="none" />
    <path d="m25 10a3.0034 3.0034 0 0 1 3 3v30a3.0034 3.0034 0 0 1 -3 3h-20a3.0034 3.0034 0 0 1 -3-3v-30a3.0034 3.0034 0 0 1 3-3zm0-2h-20a5 5 0 0 0 -5 5v30a5 5 0 0 0 5 5h20a5 5 0 0 0 5-5v-30a5 5 0 0 0 -5-5zm-4.25 36c0-.4141-.3359-1-.75-1h-10c-.4141 0-.75.5859-.75 1s.3359 1 .75 1h10c.4141 0 .75-.5859.75-1z" />
  </svg>
);

const WatchSvgIcon = ({ className }) => (
  <svg viewBox="0 0 25.582 56" className={className} fill="currentColor">
    <rect x="-16" width="56" height="56" fill="none" />
    <path d="M25.1665,21.4763a1.4612,1.4612,0,0,0-1.1086-.4355H24a7.3052,7.3052,0,0,0-.9819-3.7126,6.0217,6.0217,0,0,0-2.2864-2.2468,3.4465,3.4465,0,0,1-1.1189-.8514,3.89,3.89,0,0,1-.6426-1.2869l-.6743-2.2175a2.0626,2.0626,0,0,0-.8508-1.2376,2.5163,2.5163,0,0,0-1.3462-.3661H7.9214a2.5018,2.5018,0,0,0-1.3555.3661,2.08,2.08,0,0,0-.8415,1.2376l-.6927,2.2175A3.5618,3.5618,0,0,1,4.3984,14.25a3.4041,3.4041,0,0,1-1.1088.8316A5.8668,5.8668,0,0,0,1.002,17.3186,7.4191,7.4191,0,0,0,0,21.12v13.8a7.2817,7.2817,0,0,0,1.002,3.7516A6.03,6.03,0,0,0,3.29,40.9186a3.9866,3.9866,0,0,1,1.1088.8615,3.4576,3.4576,0,0,1,.6333,1.2966l.6927,2.2174a2.0684,2.0684,0,0,0,.8415,1.2174,2.4977,2.4977,0,0,0,1.3555.3665h8.1775a2.6263,2.6263,0,0,0,1.3462-.3462,1.986,1.986,0,0,0,.8508-1.2377l.6743-2.2174a3.1726,3.1726,0,0,1,1.7615-2.1581,6.0168,6.0168,0,0,0,2.2864-2.2474A7.27,7.27,0,0,0,24,34.92l-.12-8.058h.1778a1.4282,1.4282,0,0,0,1.1086-.4554,1.6924,1.6924,0,0,0,.4155-1.1879V22.684A1.6773,1.6773,0,0,0,25.1665,21.4763ZM22,35.2068A4.2931,4.2931,0,0,1,17.707,39.5H6.293A4.2931,4.2931,0,0,1,2,35.2068V20.7931A4.2931,4.2931,0,0,1,6.293,16.5H17.707A4.2931,4.2931,0,0,1,22,20.7931Z" />
  </svg>
);

const HeadphonesSvgIcon = ({ className }) => (
  <svg viewBox="0 0 36 56" className={className} fill="currentColor">
    <path d="m0 0h36v56h-36z" fill="none" />
    <path d="m13.6011 25.3384c.137-.0878.2664-.188.3989-.2831v13.9447h-5v-12.1804l.0303-.0011c.1064-.0034.2126-.0078.3171-.0172.1582-.0139.3154-.0364.4729-.0603l.0737-.0111.0608-.0079c.0999-.0126.1995-.0264.2976-.0448.1875-.0354.3689-.0809.5508-.1282l.0503-.0131c.1189-.0269.2031-.0472.2864-.0717.2991-.0883.5894-.1897.8672-.3029.5593-.2271 1.0964-.5043 1.594-.823zm-4.6011 18.0686c0 .4807.1482.8477.4463 1.1006.2961.2532.7095.3796 1.2407.3796h1.6077c.543 0 .9624-.1265 1.2605-.3796.2964-.2529.4448-.6199.4448-1.1006v-2.407h-5zm6.7729-26.0337c.0115.1542.0342.3052.0356.4628 0 .2401-.012.4766-.0361.7095-.0718.6989-.252 1.3654-.5403 1.9998-.384.8468-.9177 1.5939-1.603 2.2421-.3418.3241-.7107.6132-1.1067.8668-.3962.2538-.8196.4722-1.27.655-.2214.0902-.4465.1683-.6746.2356-.0742.0217-.1506.0354-.2251.0548-.1558.0403-.3105.0819-.469.1118-.093.0175-.1885.0262-.283.04-.1433.0212-.2854.0449-.4309.0577-.1028.0092-.2085.0094-.3127.0144-.1238.0059-.2461.0171-.3716.0171-.032 0-.064-.0001-.0959-.0006-.144-.0029-.2803-.0172-.4207-.0259-.771-.0475-1.4854-.1779-2.1401-.3956-.1787-.0593-.3572-.1187-.5271-.1907-.9067-.3842-1.6963-.8735-2.3674-1.4673-.6733-.5947-1.2134-1.2032-1.6216-1.8274-.084-.129-.1577-.2626-.2207-.4008-.189-.4141-.2834-.8688-.2834-1.3639v-2.593c0-.3361.0422-.6511.126-.9453.0515-.1792.1233-.3479.2058-.5115.0527-.1049.1064-.2094.1724-.3077.4202-.6362.9641-1.255 1.6299-1.8552.6667-.6002 1.4524-1.0951 2.3591-1.4857.1006-.0433.2085-.0752.3123-.1136.7131-.2646 1.4983-.4154 2.355-.4526.1404-.0061.2766-.0182.4207-.0182.6724 0 1.3159.0793 1.9312.2383.6152.1591 1.2021.3975 1.761.7156.4185.2385.7954.516 1.1526.813.559.4949 1.1147 1.0609 1.5388 1.7172.3391.5254.5947 1.0769.7671 1.6545.1299.4333.197.8862.2327 1.3491zm-10.9033-1.4869c0-.5522-.4478-1-1-1s-1 .4478-1 1v4.1307c0 .5522.4478 1 1 1s1-.4478 1-1zm22.0464 10.7966c-.1062-.0033-.2124-.0078-.3188-.0171-.1599-.0143-.3169-.0369-.4744-.0607l-.0708-.0106-.064-.0084c-.1003-.0126-.2002-.0265-.2986-.045-.1877-.0355-.3721-.0819-.5564-.1299l-.0764-.0188c-.0847-.019-.1689-.0394-.2561-.0649-.2952-.0872-.5854-.1886-.8608-.3008-.5615-.2279-1.0984-.505-1.5969-.8242-.1177-.0756-.2283-.1625-.3428-.2433v14.0408h5v-12.3138l-.0063-.0004-.0776-.0028zm-4.916 16.724c0 .4807.1484.8477.4448 1.1006.2981.2532.7175.3796 1.2605.3796h1.6077c.5312 0 .9446-.1265 1.2407-.3796.2981-.2529.4463-.6199.4463-1.1006v-2.407h-5zm13.1357-26.9669v2.5929c0 .4952-.0945.9498-.2834 1.364-.0632.1381-.1367.2716-.2207.4006-.4082.6243-.9482 1.2328-1.6216 1.8274-.6711.5938-1.4607 1.0833-2.3674 1.4673-.1699.072-.3484.1315-.5273.1908-.6545.2177-1.3689.3481-2.1399.3956-.1404.0085-.2766.0228-.4207.0259-.032.0004-.064.0005-.0959.0005-.1255 0-.2478-.0112-.3716-.0171-.1042-.0049-.21-.0052-.3127-.0143-.1455-.0129-.2876-.0365-.4309-.0577-.0945-.0139-.1899-.0226-.283-.0402-.1584-.0299-.3132-.0714-.469-.1118-.0745-.0194-.1509-.0331-.2251-.0548-.228-.0673-.4531-.1454-.6746-.2356-.4504-.1829-.8738-.4012-1.27-.6549-.396-.2538-.7649-.5427-1.1067-.8668-.6853-.6483-1.219-1.3954-1.603-2.2421-.2883-.6344-.4685-1.301-.5403-1.9998-.0242-.2329-.0361-.4695-.0361-.7095.0015-.1577.0242-.3086.0356-.4629.0356-.4629.1028-.9158.2327-1.349.1724-.5778.428-1.1293.7671-1.6547.4241-.6562.9438-1.2223 1.5388-1.7172.3572-.2969.7341-.5743 1.1526-.813.5588-.3181 1.1458-.5565 1.761-.7155s1.2588-.2384 1.9312-.2384c.144 0 .2803.0122.4207.0182.8567.0372 1.6418.1881 2.355.4526.1038.0386.2117.0704.3123.1136.9067.3906 1.6924.8856 2.3591 1.4858.6658.6002 1.2097 1.2189 1.6299 1.8551.0659.0985.1196.2029.1724.3077.0825.1636.1543.3324.2058.5116.0837.2941.126.6091.126.9453zm-2.061-.6892c0-.5522-.4478-1-1-1s-1 .4478-1 1v4.1306c0 .5522.4478 1 1 1s1-.4478 1-1z" />
  </svg>
);

const TvHomeCombinedIcon = ({ className }) => (
  <svg viewBox="0 0 68 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="68" height="56" fill="none" />
    {/* TV Screen */}
    <rect x="3" y="11" width="42" height="25" rx="3.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
    {/* TV Stand Neck & Base */}
    <path d="M20 36v3.5h8V36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M15 39.5h18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    
    {/* HomePod Cutout Mask */}
    <rect x="33" y="19" width="22" height="24" rx="7" fill="white" />
    {/* HomePod Outer Outline */}
    <rect x="33.5" y="19.5" width="21" height="23" rx="6.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
    {/* HomePod Top Touch Interface */}
    <ellipse cx="44" cy="22" rx="5.5" ry="1.8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const TVSvgIcon = ({ className }) => (
  <svg viewBox="0 0 40 56" className={className} fill="currentColor">
    <path d="m0 0h40v56h-40z" fill="none" />
    <path d="m39.3011 23.5668-3.7545-5.7843c-1.2629-1.796-2.5476-2.7825-4.2604-2.7825h-22.5719c-1.7128 0-2.9974.9865-4.2609 2.7825l-3.7544 5.7842a4.4893 4.4893 0 0 0 -.699 2.4333v8.5682c0 4.2586 2.1411 6.4318 6.3163 6.4318h27.3679c4.1747 0 6.3158-2.1732 6.3158-6.4318v-8.5682a4.4892 4.4892 0 0 0 -.6989-2.4332zm-36.9246 1.0888 3.7335-5.7517c1.1835-1.6725 1.951-1.9039 2.6043-1.9039h22.5719c.6533 0 1.4209.2315 2.6037 1.9036l3.7336 5.7522a2.4933 2.4933 0 0 1 .3765 1.3442c0 1.0652-.6473 2-1.3851 2h-33.2298c-.7378 0-1.3851-.9343-1.3851-1.9995a2.494 2.494 0 0 1 .3765-1.3449zm35.6235 9.9126c0 3.1478-1.25 4.4318-4.3158 4.4318h-27.3679c-3.0658 0-4.3163-1.284-4.3163-4.4318v-4.9258a2.9331 2.9331 0 0 0 1.3851.3576h33.23a2.9331 2.9331 0 0 0 1.3849-.3576z" />
  </svg>
);

const HomePodIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 31 56"
    className={className}
    fill="currentColor"
  >
    <g id="homepod_elevated_np">
      <rect id="box_" width="31" height="56" fill="none" />
      <path
        id="art_"
        d="M3.82,13.7424c2.28,2.2424,6.4089,3.4743,11.6706,3.4743,5.2986,0,9.449-1.2434,11.691-3.4734A9.9841,9.9841,0,0,1,29,20.0493V35.1214C29,40.5118,27.3633,45.5,15.49,45.5c-4.9394,0-8.3769-.8233-10.509-2.517C2.9473,41.3671,2,38.869,2,35.1214V20.0493a9.9832,9.9832,0,0,1,1.82-6.3069M27.1565,11.5a1.8775,1.8775,0,0,0-1.2505.6864c-1.7517,1.8419-5.3376,3.03-10.4158,3.03s-8.6445-1.1884-10.3962-3.03a1.9273,1.9273,0,0,0-1.2578-.6837,1.9988,1.9988,0,0,0-1.376.7431C1.1809,13.7511,0,16.1872,0,20.0493V35.1214C0,43.7567,4.8025,47.5,15.49,47.5S31,43.7567,31,35.1214V20.0493c0-3.8621-1.1809-6.2982-2.46-7.8035A2.0092,2.0092,0,0,0,27.1565,11.5ZM15.5,13.5405c5.1229,0,8.5-1.0263,8.5-2.5s-3.3771-2.5-8.5-2.5S7,9.5665,7,11.0405,10.3767,13.5405,15.5,13.5405Z"
      />
    </g>
  </svg>
);

const PLAN_TILES = {
  iPhone: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your iPhone.',
    priceText: 'From ₹11900.00 for 2 years',
    monthlyText: 'or ₹599.00/mo. until cancelled.',
    priceVal: 11900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Battery replacements at no extra charge',
      'Priority support from Apple experts',
      'AppleCare+ with Theft and Loss is available for purchase on your device'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/iphone_single__dkwnumzl55w2_large_2x.jpg',
    alt: 'iPhone Pro back exterior'
  },
  Mac: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your Mac.',
    priceText: 'From ₹12900.00 for 3 years',
    monthlyText: 'or ₹429.00/mo. until cancelled.',
    priceVal: 12900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Battery replacements at no extra charge',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/mac_single__liw1wq012xme_large_2x.jpg',
    alt: 'MacBook open'
  },
  Display: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your display.',
    priceText: 'From ₹14900.00 for 3 years',
    monthlyText: 'or ₹499.00/mo. until cancelled.',
    priceVal: 14900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Apple-certified repairs using genuine Apple parts',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/display_single__bcorwfyqszaq_large_2x.jpg',
    alt: 'Apple Studio Display'
  },
  iPad: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your iPad.',
    priceText: 'From ₹8900.00 for 2 years',
    monthlyText: 'or ₹449.00/mo. until cancelled.',
    priceVal: 8900,
    features: [
      'Unlimited repairs for accidents, like drops and spills',
      'Battery replacements at no extra charge',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/ipad_single__dzq694a9v0eq_large_2x.jpg',
    alt: 'iPad Pro back view'
  },
  Watch: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your Apple Watch.',
    priceText: 'From ₹4900.00 for 2 years',
    monthlyText: 'or ₹249.00/mo. until cancelled.',
    priceVal: 4900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Battery replacements at no extra charge',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/watch_single__nif1z4j14cya_large_2x.jpg',
    alt: 'Apple Watch Series'
  },
  AirPods: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your headphones.',
    priceText: 'From ₹2900.00 for 2 years',
    monthlyText: 'or ₹149.00/mo. until cancelled.',
    priceVal: 2900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Battery replacements at no extra charge',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/headphones_single__ev6j5f739ggi_large_2x.jpg',
    alt: 'AirPods Max and AirPods Pro'
  },
  TV: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your Apple TV.',
    priceText: 'From ₹2900.00 for 3 years',
    monthlyText: 'or ₹99.00/mo. until cancelled.',
    priceVal: 2900,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/apple_tv_single__b3vn6fascz0i_large_2x.jpg',
    alt: 'Apple TV 4K & Siri Remote'
  },
  HomePod: {
    eyebrow: 'AppleCare+',
    headline: 'Cover your HomePod.',
    priceText: 'From ₹1600.00 for 2 years',
    monthlyText: 'or ₹79.00/mo. until cancelled.',
    priceVal: 1600,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Priority support from Apple experts'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/homepod_single__ecv85j2jxzo2_large_2x.jpg',
    alt: 'HomePod smart speaker'
  },
  'TV & Home': {
    eyebrow: 'AppleCare+',
    headline: 'Cover your TV & Home products.',
    priceText: 'From ₹1600.00 for 2 years',
    monthlyText: 'or ₹79.00/mo. until cancelled.',
    priceVal: 1600,
    features: [
      'Unlimited repairs for accidents like drops and spills',
      'Priority support from Apple experts',
      'Full coverage for Apple TV, HomePod, and HomePod mini'
    ],
    image: 'https://www.apple.com/in/applecare/images/overview/plans/apple_tv_single__b3vn6fascz0i_large_2x.jpg',
    alt: 'TV & Home products'
  },
};

const DEFAULT_PRICING_TABLES = [
  {
    categoryKey: 'iphone',
    image: '/iphone_category_v2.jpg',
    headline: 'Cover your iPhone.',
    subheadline: 'AppleCare+ for iPhone includes unlimited incidents of accidental damage protection.',
    durationLabel: '2 years',
    isActive: true,
    rows: [
      {
        model: 'iPhone 17e',
        title: 'AppleCare+ for iPhone 17e',
        description: '2 Years Apple-certified coverage for iPhone 17e',
        sku: 'SCYW3HN/A',
        mrp: '₹14,900.00',
        discount: '18%',
        salePrice: '11,900.00',
        monthly: '₹599.00',
        yearly: '11,900.00',
        planType: 'APPLE CARE+ • 2 YEAR PLAN',
        duration: '2 Years',
        image: '',
        isActive: true
      },
      {
        model: 'iPhone 17, iPhone 16',
        title: 'AppleCare+ for iPhone 17',
        description: '2 Years Apple-certified coverage for iPhone 17, iPhone 16',
        sku: 'SX2V2HN/A',
        mrp: '₹27,900.00',
        discount: '18%',
        salePrice: '22,900.00',
        monthly: '₹749.00',
        yearly: '14,900.00',
        planType: 'APPLE CARE+ • 2 YEAR PLAN',
        duration: '2 Years',
        image: '',
        isActive: true
      },
      {
        model: 'iPhone 16 Plus',
        title: 'AppleCare+ for iPhone 16 Plus',
        description: '2 Years Apple-certified coverage for iPhone 16 Plus',
        sku: 'SX3V2HN/A',
        mrp: '₹21,900.00',
        discount: '18%',
        salePrice: '17,900.00',
        monthly: '₹899.00',
        yearly: '17,900.00',
        planType: 'APPLE CARE+ • 2 YEAR PLAN',
        duration: '2 Years',
        image: '',
        isActive: true
      },
      {
        model: 'iPhone Air, iPhone 17 Pro, iPhone 17 Pro Max',
        title: 'AppleCare+ for iPhone 17 Pro',
        description: '2 Years Apple-certified coverage for iPhone Air, 17 Pro & 17 Pro Max',
        sku: 'SX4V2HN/A',
        mrp: '₹25,900.00',
        discount: '19%',
        salePrice: '20,900.00',
        monthly: '₹1,049.00',
        yearly: '20,900.00',
        planType: 'APPLE CARE+ • 2 YEAR PLAN',
        duration: '2 Years',
        image: '',
        isActive: true
      }
    ]
  },
  {
    categoryKey: 'mac',
    image: '/macbook_category_v3.jpg',
    headline: 'Cover your Mac.',
    subheadline: 'AppleCare+ for Mac provides up to 3 years of expert support and hardware coverage.',
    durationLabel: '3 years',
    isActive: true,
    rows: [
      { model: 'Mac mini', title: 'AppleCare+ for Mac mini', description: '3 Years Apple-certified coverage for Mac mini', sku: 'AC-MAC-MINI', mrp: '₹14,900.00', discount: '13% OFF', salePrice: '₹12,900.00', monthly: '₹429.00', yearly: '₹12,900.00', isActive: true, image: 'https://www.apple.com/assets-www/en_WW/mac/04_chapternav/small/nav_mac_mini_f628f615d_2x.png' },
      { model: 'Mac Studio', title: 'AppleCare+ for Mac Studio', description: '3 Years Apple-certified coverage for Mac Studio', sku: 'AC-MAC-STUDIO', mrp: '₹22,900.00', discount: '13% OFF', salePrice: '₹19,900.00', monthly: '₹679.00', yearly: '₹19,900.00', isActive: true, image: '/mac_nav/mac_studio.png' },
      { model: 'iMac', title: 'AppleCare+ for iMac', description: '3 Years Apple-certified coverage for iMac', sku: 'AC-IMAC-24', mrp: '₹22,900.00', discount: '13% OFF', salePrice: '₹19,900.00', monthly: '₹679.00', yearly: '₹19,900.00', isActive: true, image: '/mac_nav/imac.png' },
      { model: 'Macbook Neo', title: 'AppleCare+ for Macbook Neo', description: '3 Years Apple-certified coverage for Macbook Neo', sku: 'AC-MACBOOK-NEO', mrp: '₹18,900.00', discount: '11% OFF', salePrice: '₹16,900.00', monthly: '₹579.00', yearly: '₹16,900.00', isActive: true, image: '/mac_nav/macbook_neo.png' },
      { model: 'MacBook Air 13″', title: 'AppleCare+ for MacBook Air 13″', description: '3 Years Apple-certified coverage for MacBook Air 13″', sku: 'AC-MBA-13', mrp: '₹25,900.00', discount: '12% OFF', salePrice: '₹22,900.00', monthly: '₹779.00', yearly: '₹22,900.00', isActive: true, image: '/mac_nav/macbook_air.png' },
      { model: 'MacBook Air 15″', title: 'AppleCare+ for MacBook Air 15″', description: '3 Years Apple-certified coverage for MacBook Air 15″', sku: 'AC-MBA-15', mrp: '₹27,900.00', discount: '12% OFF', salePrice: '₹24,900.00', monthly: '₹849.00', yearly: '₹24,900.00', isActive: true, image: '/mac_nav/macbook_air.png' },
      { model: 'MacBook Pro 14″', title: 'AppleCare+ for MacBook Pro 14″', description: '3 Years Apple-certified coverage for MacBook Pro 14″', sku: 'AC-MBP-14', mrp: '₹33,900.00', discount: '12% OFF', salePrice: '₹29,900.00', monthly: '₹999.00', yearly: '₹29,900.00', isActive: true, image: '/mac_nav/macbook_pro.png' },
      { model: 'MacBook Pro 16″', title: 'AppleCare+ for MacBook Pro 16″', description: '3 Years Apple-certified coverage for MacBook Pro 16″', sku: 'AC-MBP-16', mrp: '₹45,900.00', discount: '11% OFF', salePrice: '₹40,900.00', monthly: '₹1,379.00', yearly: '₹40,900.00', isActive: true, image: '/mac_nav/macbook_pro.png' },
      { model: 'Mac Pro', title: 'AppleCare+ for Mac Pro', description: '3 Years Apple-certified coverage for Mac Pro', sku: 'AC-MAC-PRO', mrp: '₹55,900.00', discount: '11% OFF', salePrice: '₹49,900.00', monthly: '₹1,699.00', yearly: '₹49,900.00', isActive: true, image: '/mac_nav/mac_studio.png' }
    ]
  },
  {
    categoryKey: 'display',
    image: 'https://www.apple.com/in/applecare/images/overview/plans/display_single__bcorwfyqszaq_large_2x.jpg',
    headline: 'Cover your display.',
    subheadline: 'AppleCare+ for Display provides up to 3 years of expert support and hardware coverage.',
    durationLabel: '3 years',
    isActive: true,
    rows: [
      { model: 'Studio Display', title: 'AppleCare+ for Studio Display', description: '3 Years Apple-certified coverage for Studio Display', sku: 'AC-STUDIO-DISPLAY', mrp: '₹14,900.00', discount: '13% OFF', salePrice: '12,900.00', monthly: '₹499.00', yearly: '12,900.00', isActive: true },
      { model: 'Pro Display XDR', title: 'AppleCare+ for Pro Display XDR', description: '3 Years Apple-certified coverage for Pro Display XDR', sku: 'AC-PRO-DISPLAY-XDR', mrp: '₹49,900.00', discount: '10% OFF', salePrice: '44,900.00', monthly: '₹1,499.00', yearly: '44,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'ipad',
    image: '/ipad_category_v3.png',
    headline: 'Cover your iPad.',
    subheadline: 'AppleCare+ for iPad covers your iPad, Apple Pencil, and Apple-branded keyboards.',
    durationLabel: '2 years',
    isActive: true,
    rows: [
      { model: 'iPad, iPad mini', title: 'AppleCare+ for iPad', description: '2 Years Apple-certified coverage for iPad', sku: 'AC-IPAD-STD', mrp: '₹9,900.00', discount: '10% OFF', salePrice: '₹8,900.00', monthly: '₹449.00', yearly: '₹8,900.00', isActive: true },
      { model: 'iPad Air 11″', title: 'AppleCare+ for iPad Air 11″', description: '2 Years Apple-certified coverage for iPad Air 11″', sku: 'AC-IPAD-AIR11', mrp: '₹10,900.00', discount: '9% OFF', salePrice: '₹9,900.00', monthly: '₹499.00', yearly: '₹9,900.00', isActive: true },
      { model: 'iPad Air 13″', title: 'AppleCare+ for iPad Air 13″', description: '2 Years Apple-certified coverage for iPad Air 13″', sku: 'AC-IPAD-AIR13', mrp: '₹12,900.00', discount: '8% OFF', salePrice: '₹11,900.00', monthly: '₹599.00', yearly: '₹11,900.00', isActive: true },
      { model: 'iPad Pro 11″', title: 'AppleCare+ for iPad Pro 11″', description: '2 Years Apple-certified coverage for iPad Pro 11″', sku: 'AC-IPAD-PRO11', mrp: '₹19,900.00', discount: '10% OFF', salePrice: '₹17,900.00', monthly: '₹899.00', yearly: '₹17,900.00', isActive: true },
      { model: 'iPad Pro 13″', title: 'AppleCare+ for iPad Pro 13″', description: '2 Years Apple-certified coverage for iPad Pro 13″', sku: 'AC-IPAD-PRO13', mrp: '₹21,900.00', discount: '9% OFF', salePrice: '₹19,900.00', monthly: '₹999.00', yearly: '₹19,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'watch',
    image: '/watch_category.jpg',
    headline: 'Cover your Apple Watch.',
    subheadline: 'AppleCare+ for Apple Watch provides 2 years of accidental damage protection.',
    durationLabel: '2 years',
    isActive: true,
    rows: [
      { model: 'Apple Watch SE', title: 'AppleCare+ for Apple Watch SE', description: '2 Years Apple-certified coverage for Apple Watch SE', sku: 'AC-WATCH-SE', mrp: '₹5,900.00', discount: '17% OFF', salePrice: '₹4,900.00', monthly: '₹249.00', yearly: '₹4,900.00', isActive: true },
      { model: 'Apple Watch Series 11', title: 'AppleCare+ for Apple Watch Series 11', description: '2 Years Apple-certified coverage for Apple Watch Series 11', sku: 'AC-WATCH-S11', mrp: '₹8,900.00', discount: '11% OFF', salePrice: '₹7,900.00', monthly: '₹399.00', yearly: '₹7,900.00', isActive: true },
      { model: 'Apple Watch Ultra 3', title: 'AppleCare+ for Apple Watch Ultra 3', description: '2 Years Apple-certified coverage for Apple Watch Ultra 3', sku: 'AC-WATCH-ULTRA', mrp: '₹11,900.00', discount: '17% OFF', salePrice: '₹9,900.00', monthly: '₹499.00', yearly: '₹9,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'airpods',
    image: '/airpods_category.jpg',
    headline: 'Cover your headphones.',
    subheadline: 'AppleCare+ for Headphones covers AirPods Pro, AirPods Max and Beats.',
    durationLabel: '2 years',
    isActive: true,
    rows: [
      { model: 'AirPods 4, Beats', title: 'AppleCare+ for AirPods 4', description: '2 Years Apple-certified coverage for AirPods 4', sku: 'AC-AIRPODS-4', mrp: '₹3,490.00', discount: '17% OFF', salePrice: '₹2,900.00', monthly: '₹149.00', yearly: '₹2,900.00', isActive: true },
      { model: 'AirPods Pro 3', title: 'AppleCare+ for AirPods Pro 3', description: '2 Years Apple-certified coverage for AirPods Pro 3', sku: 'AC-AIRPODS-PRO', mrp: '₹5,900.00', discount: '17% OFF', salePrice: '₹4,900.00', monthly: '₹249.00', yearly: '₹4,900.00', isActive: true },
      { model: 'AirPods Max 2', title: 'AppleCare+ for AirPods Max 2', description: '2 Years Apple-certified coverage for AirPods Max 2', sku: 'AC-AIRPODS-MAX', mrp: '₹7,900.00', discount: '13% OFF', salePrice: '₹6,900.00', monthly: '₹349.00', yearly: '₹6,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'tv-home',
    image: '/applecare_official_hero.png',
    headline: 'Cover your TV & Home products.',
    subheadline: 'AppleCare+ for TV & Home provides expert technical support and hardware coverage.',
    durationLabel: '3 years',
    isActive: true,
    rows: [
      { model: 'Apple TV 4K', title: 'AppleCare+ for Apple TV 4K', description: '3 Years Apple-certified coverage for Apple TV 4K', sku: 'AC-TV-4K', mrp: '₹3,490.00', discount: '17% OFF', salePrice: '2,900.00', monthly: '₹99.00', yearly: '2,900.00', isActive: true },
      { model: 'HomePod mini', title: 'AppleCare+ for HomePod mini', description: '2 Years Apple-certified coverage for HomePod mini', sku: 'AC-HOMEPOD-MINI', mrp: '₹1,990.00', discount: '20% OFF', salePrice: '1,600.00', monthly: '₹79.00', yearly: '1,600.00', isActive: true },
      { model: 'HomePod', title: 'AppleCare+ for HomePod', description: '2 Years Apple-certified coverage for HomePod', sku: 'AC-HOMEPOD-STD', mrp: '₹4,900.00', discount: '20% OFF', salePrice: '3,900.00', monthly: '₹199.00', yearly: '3,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'tv',
    image: '/applecare_official_hero.png',
    headline: 'Cover your Apple TV.',
    subheadline: 'AppleCare+ for Apple TV includes 3 years of hardware support.',
    durationLabel: '3 years',
    isActive: true,
    rows: [
      { model: 'Apple TV 4K', title: 'AppleCare+ for Apple TV 4K', description: '3 Years Apple-certified coverage for Apple TV 4K', sku: 'AC-TV-4K', mrp: '₹3,490.00', discount: '17% OFF', salePrice: '2,900.00', monthly: '₹99.00', yearly: '2,900.00', isActive: true }
    ]
  },
  {
    categoryKey: 'homepod',
    image: 'https://www.apple.com/in/applecare/images/overview/plans/homepod_single__ecv85j2jxzo2_large_2x.jpg',
    headline: 'Cover your HomePod.',
    subheadline: 'AppleCare+ for HomePod covers HomePod and HomePod mini.',
    durationLabel: '2 years',
    isActive: true,
    rows: [
      { model: 'HomePod mini', title: 'AppleCare+ for HomePod mini', description: '2 Years Apple-certified coverage for HomePod mini', sku: 'AC-HOMEPOD-MINI', mrp: '₹1,990.00', discount: '20% OFF', salePrice: '1,600.00', monthly: '₹79.00', yearly: '1,600.00', isActive: true },
      { model: 'HomePod', title: 'AppleCare+ for HomePod', description: '2 Years Apple-certified coverage for HomePod', sku: 'AC-HOMEPOD-STD', mrp: '₹4,900.00', discount: '20% OFF', salePrice: '3,900.00', monthly: '₹199.00', yearly: '3,900.00', isActive: true }
    ]
  }
];

export default function AppleCare() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('category') || searchParams.get('cat');
  const openModalParam = searchParams.get('modal') === 'true' || searchParams.get('openModal') === 'true';

  const resolveCategoryParam = (param) => {
    if (!param) return 'iPhone';
    const lower = param.toLowerCase().trim();
    if (lower === 'airpods' || lower === 'headphones') return 'AirPods';
    if (lower === 'tv' || lower === 'homepod' || lower === 'tv-home' || lower.includes('tv') || lower.includes('home')) return 'TV & Home';
    if (lower === 'mac') return 'Mac';
    if (lower === 'ipad') return 'iPad';
    if (lower === 'watch') return 'Watch';
    if (lower === 'display') return 'Display';
    return param.charAt(0).toUpperCase() + param.slice(1).toLowerCase();
  };

  const [selectedCategory, setSelectedCategory] = useState(() => resolveCategoryParam(catParam));
  const [selectedAppleCarePlan, setSelectedAppleCarePlan] = useState(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [wishlistMap, setWishlistMap] = useState({});
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    if (catParam) {
      setSelectedCategory(resolveCategoryParam(catParam));
    }
  }, [catParam]);

  useEffect(() => {
    if (openModalParam) {
      setIsPricingModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('modal');
      newParams.delete('openModal');
      const newSearch = newParams.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [openModalParam]);

  const [dbPlans, setDbPlans] = useState([]);
  const [dbCategoryIcons, setDbCategoryIcons] = useState([]);
  const [pricingTables, setPricingTables] = useState(DEFAULT_PRICING_TABLES);
  const scrollRef = useRef(null);
  const repairsScrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchAppleCareSettings = () => {
    setIsLoadingSettings(true);
    axiosClient.get('/settings')
      .then(res => {
        if (res.data?.appleCarePlans) {
          setDbPlans(res.data.appleCarePlans);
        }
        if (res.data?.categoryIconGroups) {
          const appleCareGrp = res.data.categoryIconGroups.find(g => g.categoryKey === 'applecare');
          if (appleCareGrp && appleCareGrp.icons) {
            setDbCategoryIcons(appleCareGrp.icons.filter(i => i.isActive !== false));
          }
        }
        if (res.data?.appleCarePricingTables && res.data.appleCarePricingTables.length > 0) {
          const dbTables = res.data.appleCarePricingTables.filter(t => t.isActive !== false);
          
          const merged = DEFAULT_PRICING_TABLES.map(def => {
            const found = dbTables.find(d => 
              d.categoryKey === def.categoryKey ||
              ((def.categoryKey === 'tv' || def.categoryKey === 'homepod' || def.categoryKey === 'tv-home') &&
               (d.categoryKey === 'tv-home' || d.categoryKey === 'tv' || d.categoryKey === 'homepod'))
            );
            if (!found) return def;
            const dbRows = (found.rows || []).filter(r => r.isActive !== false);
            return {
              ...def,
              ...found,
              categoryKey: def.categoryKey,
              rows: dbRows.length > 0 ? dbRows : def.rows
            };
          });

          dbTables.forEach(d => {
            if (!merged.some(m => m.categoryKey === d.categoryKey)) {
              merged.push(d);
            }
          });

          setPricingTables(merged);
        }
      })
      .catch(err => console.error('Error fetching AppleCare settings:', err))
      .finally(() => setIsLoadingSettings(false));
  };

  useEffect(() => {
    fetchAppleCareSettings();
    const unsub = subscribeToLiveSync(() => {
      fetchAppleCareSettings();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isPricingModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPricingModalOpen]);

  const scrollRepairs = (direction) => {
    if (!repairsScrollRef.current) return;
    const amount = repairsScrollRef.current.clientWidth * 0.75;
    repairsScrollRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / (clientWidth * 0.7));
    setCurrentIndex(Math.min(Math.max(index, 0), BENEFIT_CARDS.length - 1));
  };

  const currentCategoryKey = (selectedCategory || 'iPhone').toLowerCase();

  let activeRows = [];
  let activeCategoryTable = null;
  const isTvHomeCategory =
    currentCategoryKey === 'tv' ||
    currentCategoryKey === 'homepod' ||
    currentCategoryKey === 'tv-home' ||
    currentCategoryKey === 'tv & home' ||
    currentCategoryKey.includes('tv') ||
    currentCategoryKey.includes('home');

  if (isTvHomeCategory) {
    activeCategoryTable = pricingTables.find(t => t.categoryKey === 'tv-home' || t.categoryKey === 'tv' || t.categoryKey === 'homepod')
      || DEFAULT_PRICING_TABLES.find(t => t.categoryKey === 'tv-home')
      || DEFAULT_PRICING_TABLES[0];
    const tvTables = pricingTables.filter(t => t.categoryKey === 'tv' || t.categoryKey === 'tv-home' || t.categoryKey === 'homepod');
    tvTables.forEach(t => {
      if (t.rows && t.rows.length > 0) {
        t.rows.forEach(r => {
          if (r.isActive !== false) {
            const normModel = (r.model || r.title || '').toString().toLowerCase().trim();
            if (normModel) {
              const existingIdx = activeRows.findIndex(x => (x.model || x.title || '').toString().toLowerCase().trim() === normModel);
              if (existingIdx === -1) {
                activeRows.push(r);
              } else {
                activeRows[existingIdx] = { ...activeRows[existingIdx], ...r };
              }
            }
          }
        });
      }
    });
    if (activeRows.length === 0) {
      activeRows = (activeCategoryTable?.rows || []).filter(r => r.isActive !== false);
    }
  } else {
    activeCategoryTable = pricingTables.find(t => t.categoryKey === currentCategoryKey)
      || DEFAULT_PRICING_TABLES.find(t => t.categoryKey === currentCategoryKey)
      || DEFAULT_PRICING_TABLES[0];
    activeRows = (activeCategoryTable?.rows || []).filter(r => r.isActive !== false);
  }

  const handleAddAppleCareToCart = (rowObj) => {
    const planTitle = rowObj.title || `AppleCare+ for ${rowObj.model}`;
    const sku = rowObj.sku || '';
    const priceStr = String(rowObj.salePrice || rowObj.yearly || '0');
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 11900;
    const image = rowObj.image || '';
    const itemId = `ac-${sku || rowObj.model}`;

    dispatch(
      addToCart({
        id: itemId,
        productId: itemId,
        name: planTitle,
        title: planTitle,
        price: numericPrice,
        image: image,
        quantity: 1,
        isAppleCare: true,
        sku: sku
      })
    );
  };

  const handleAddAppleCareToWishlist = (rowObj) => {
    const planTitle = rowObj.title || `AppleCare+ for ${rowObj.model}`;
    const sku = rowObj.sku || '';
    const priceStr = String(rowObj.salePrice || rowObj.yearly || '0');
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 11900;
    const image = rowObj.image || '';
    const itemId = `ac-${sku || rowObj.model}`;

    setWishlistMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

    dispatch(
      addToWishlist({
        id: itemId,
        name: planTitle,
        title: planTitle,
        price: numericPrice,
        image: image,
        rating: 5.0,
        isAppleCare: true,
        sku: sku
      })
    );
  };

  const handleWhatsAppInquiry = (planTitle) => {
    const text = encodeURIComponent(`Hello iiNCEPT! 👋 I have an inquiry regarding ${planTitle}. Please assist me with purchasing AppleCare+ coverage.`);
    window.open(`https://wa.me/918607222417?text=${text}`, '_blank');
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#FF2D55] animate-spin" />
        <span className="text-base font-semibold text-[#1D1D1F]">Loading AppleCare+ Plans & Data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans animate-in fade-in duration-300">

      {/* Official AppleCare Hero Section */}
      <section className="section-hero bg-white !bg-white pt-16 sm:pt-20 md:pt-24 pb-16 px-6 sm:px-12 text-center border-b border-[#D2D2D7]/60 overflow-hidden w-full" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
        <div className="section-content text-center max-w-6xl mx-auto px-6">
          <div className="select-none mb-2 sm:mb-3">
            <span className="sr-only">AppleCare</span>
            <picture id="overview-hero-logo-apple-care-1" className="overview-hero-logo-apple-care block mx-auto select-none">
              <source srcSet="https://www.apple.com/v/applecare/d/images/overview/hero/logo_apple_care__ethb3t26w2ye_large_2x.png 2x" media="(min-width:0px)" />
              <img
                src="https://www.apple.com/v/applecare/d/images/overview/hero/logo_apple_care__ethb3t26w2ye_large.png"
                alt="AppleCare Logo"
                className="h-7 sm:h-8 md:h-9 w-auto mx-auto object-contain"
              />
            </picture>
          </div>
          <h2 className="section-headline typography-headline-elevated font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#1D1D1F] tracking-tight leading-[1.06] mt-2 sm:mt-3 md:mt-4 mb-6 sm:mb-8 text-center">
            Handled with<br />AppleCare.
          </h2>
        </div>

        {/* Large Official AppleCare Device Lineup Banner Image */}
        <div className="w-full max-w-6xl md:max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-8 py-4 sm:py-10 md:py-12 bg-white flex flex-col items-center justify-center text-center px-0 sm:px-4 overflow-hidden sm:overflow-visible">
          <img
            src="https://www.apple.com/in/applecare/images/overview/hero/hero__d4bput78wzu6_xlarge.jpg"
            alt="Various Apple products, including MacBook, Apple Watch, iPhone, AirPods Pro, AirPods Max"
            className="w-full h-auto object-contain object-center max-w-full mx-auto block origin-center text-center transition-transform duration-300 transform-gpu scale-130 sm:scale-120 md:scale-125 lg:scale-135 my-6 sm:my-6 md:my-8"
          />
        </div>

        <div className="content max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-6 mt-8 sm:mt-12 md:mt-16 pt-0 px-6 relative z-10">
          <p className="section-copy typography-eyebrow-reduced font-semibold text-[#1D1D1F] text-base sm:text-lg md:text-xl leading-relaxed text-center max-w-2xl sm:max-w-3xl mx-auto">
            AppleCare offers one-stop support and service for all of your Apple products — from the people who know them best. Get easy, fast repairs for accidents like drops and spills. A replacement battery when yours drops below 80% capacity. And priority care with just a&nbsp;chat, call or&nbsp;tap.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 w-full mx-auto">
            <a
              href="#plans"
              aria-label="Get coverage, AppleCare"
              className="cta button button-elevated bg-[#0071E3] hover:bg-[#0077ED] text-[#FFFFFF] px-8 py-3.5 rounded-full text-base font-semibold tracking-tight shadow-sm transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span className="icon-copy">Get coverage</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => handleWhatsAppInquiry('AppleCare+ Protection Plans')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-full text-base font-semibold tracking-tight shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Ask on WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Plans & Pricing Section */}
      <section id="plans" className="py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1D1D1F] tracking-tight leading-[1.08]">
            Peace of mind<br />in every plan.
          </h2>
        </div>

        {/* Device Category Icon Nav Bar */}
        <div className="relative border-b border-[#D2D2D7]/80 pb-0 mb-12 -mx-6 sm:mx-0">
          <div className="flex items-end justify-start sm:justify-center gap-5 sm:gap-10 md:gap-12 overflow-x-auto scrollbar-none px-6 sm:px-4">
            {[
              { id: 'iPhone', label: 'iPhone', icon: IPhoneSvgIcon },
              { id: 'Mac', label: 'Mac', icon: MacSvgIcon },
              { id: 'Display', label: 'Display', icon: DisplaySvgIcon },
              { id: 'iPad', label: 'iPad', icon: IPadSvgIcon },
              { id: 'Watch', label: 'Watch', icon: WatchSvgIcon },
              { id: 'AirPods', label: 'AirPods', icon: HeadphonesSvgIcon },
              { id: 'TV & Home', label: 'TV & Home', icon: TvHomeCombinedIcon }
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = selectedCategory.toLowerCase() === item.id.toLowerCase();
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id)}
                  className={`flex flex-col items-center justify-end gap-2 px-3 pb-3 text-xs sm:text-sm font-normal relative transition-all cursor-pointer group shrink-0 ${isActive ? 'text-[#1D1D1F] font-semibold border-b-2 border-[#1D1D1F]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                >
                  <div className="h-12 sm:h-14 flex items-end justify-center w-full">
                    <IconComponent className={`h-10 sm:h-12 w-auto transition-transform group-hover:scale-105 ${isActive ? 'text-[#1D1D1F]' : 'text-[#6E6E73] group-hover:text-[#1D1D1F]'
                      }`} />
                  </div>
                  <span className="tracking-tight whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>



        {/* Dynamic AppleCare+ Product Cards Grid (Matching Screenshot 2) */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                AppleCare+ Product Plans for {selectedCategory}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                Official Apple-certified coverage, fast repairs, and 24/7 priority support.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-[#FF2D55] rounded-full border border-rose-100">
              {activeRows.length} {selectedCategory} Products
            </span>
          </div>

          {activeRows.length === 0 ? (
            <div className="bg-[#FBFBFD] rounded-3xl p-10 text-center border border-zinc-200/60">
              <ShieldCheck className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-base font-semibold text-zinc-700">No active AppleCare+ products available for {selectedCategory}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeRows.map((row, idx) => {
                const mrpStr = row.mrp || '';
                const mrpNum = parseFloat(String(mrpStr).replace(/[^0-9.]/g, '')) || 0;
                const discNum = Math.min(100, Math.max(0, parseFloat(String(row.discount).replace(/[^0-9.]/g, '')) || 0));

                const finalNum = mrpNum > 0 && discNum > 0
                  ? Math.max(0, Math.round(mrpNum - (mrpNum * discNum / 100)))
                  : (parseFloat(String(row.salePrice || row.yearly || '0').replace(/[^0-9.]/g, '')) || mrpNum);

                const formattedPrice = `₹${finalNum.toLocaleString('en-IN')}`;
                const formattedMrp = mrpStr.includes('₹') ? mrpStr : (mrpNum > 0 ? `₹${mrpNum.toLocaleString('en-IN')}` : '');

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-[#D2D2D7]/60 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-all duration-200"
                  >
                    {/* Top Grid: Left Graphic & Right Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Image Box */}
                      <div className="sm:col-span-5 bg-[#F5F5F7] rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between min-h-[260px] relative border border-zinc-200/60">
                        <div className="absolute top-3 left-3 bg-[#FF2D55] text-white font-extrabold text-[10px] sm:text-[11px] px-3 py-1 rounded-full shadow-2xs">
                          AppleCare+ ({row.duration || activeCategoryTable?.durationLabel || '2 Years'})
                        </div>

                        <div className="my-auto flex items-center justify-center h-[150px] w-full pt-4">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt={row.title || row.model}
                              className="max-h-[130px] w-auto object-contain transition-transform hover:scale-105 duration-300"
                              style={{ mixBlendMode: 'multiply' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`flex flex-col items-center justify-center text-zinc-400 space-y-2 ${row.image ? 'hidden' : ''}`}
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-2xs border border-zinc-200/80">
                              <ShieldCheck className="w-8 h-8 text-[#FF2D55]" />
                            </div>
                            <span className="text-xs font-bold text-zinc-600 text-center">AppleCare+ Protected</span>
                          </div>
                        </div>

                        <div className="text-center w-full pt-2.5 border-t border-zinc-200/60">
                          <div className="font-extrabold text-[#1D1D1F] text-sm sm:text-base tracking-tight flex items-center justify-center gap-1">
                            <span></span>
                            <span>{row.model}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono font-semibold mt-0.5">
                            {row.sku ? `SKU: ${row.sku}` : 'SKU: N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Title & Pricing */}
                      <div className="sm:col-span-7 space-y-3 flex flex-col justify-between h-full">
                        <div>
                          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#FF2D55] mb-1">
                            {row.planType || `APPLE CARE+ • ${(row.duration || activeCategoryTable?.durationLabel || '2 YEAR PLAN').toUpperCase()}`}
                          </div>
                          <h3 className="font-extrabold text-[#1D1D1F] text-lg sm:text-xl leading-snug tracking-tight">
                            {row.title || `AppleCare+ for ${row.model}`}
                          </h3>
                          <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                            {row.description || `${row.duration || '2 Years'} Apple-certified coverage for ${row.model}`}
                          </p>
                        </div>

                        {/* Pricing Block */}
                        <div className="space-y-1.5 pt-2.5 border-t border-zinc-100">
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span className="font-semibold text-zinc-500">MRP</span>
                            <div className="flex items-center gap-2">
                              {formattedMrp && <span className="line-through text-zinc-600 font-semibold">{formattedMrp}</span>}
                            </div>
                          </div>

                          {discNum > 0 ? (
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-500">Discount</span>
                              <span className="font-bold text-[#FF2D55]">-{discNum}%</span>
                            </div>
                          ) : (
                            <div className="h-4"></div>
                          )}

                          <div className="border-b border-zinc-100 my-1"></div>

                          <div className="flex items-baseline justify-between">
                            <span className="font-extrabold text-[#1D1D1F] text-sm sm:text-base">Final Price</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-[#00875A] tabular-nums tracking-tight">
                              {formattedPrice}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1 text-[11px] text-zinc-400 font-medium">
                            <span>GST Paid</span>
                            <span className="text-xs">ⓘ</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Feature Highlights Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-100 text-center">
                      <div className="bg-[#F9F9FB] rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 border border-zinc-100">
                        <Wrench className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#1D1D1F] leading-tight">
                          {row.duration || '2 Years'} Peace of Mind
                        </span>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 border border-zinc-100">
                        <MessageSquare className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#1D1D1F] leading-tight">
                          Priority Support
                        </span>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 border border-zinc-100">
                        <ShieldCheck className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#1D1D1F] leading-tight">
                          Damage Protection
                        </span>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 border border-zinc-100">
                        <Battery className="w-4 h-4 text-[#FF2D55]" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-[#1D1D1F] leading-tight">
                          Battery Coverage
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAddAppleCareToWishlist(row)}
                        className={`w-full border font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer ${
                          wishlistMap[`ac-${row.sku || row.model}`]
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-[#1D1D1F] text-white border-zinc-900 hover:bg-zinc-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wishlistMap[`ac-${row.sku || row.model}`] ? 'fill-current text-rose-500' : 'text-white'}`} />
                        <span>{wishlistMap[`ac-${row.sku || row.model}`] ? 'Wishlisted' : 'Add to Wishlist'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddAppleCareToCart(row)}
                        className="w-full bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Repairs Made Easy Section */}
      <section className="pt-10 pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div className="section-content text-left max-w-2xl">
            <h3 className="typography-headline-reduced font-bold text-4xl sm:text-5xl md:text-6xl text-[#1D1D1F] tracking-tight leading-[1.08] mb-4">
              {getDeviceLabel(selectedCategory)} repairs made easy.
            </h3>
            <p className="subhead typography-label font-normal text-xl sm:text-2xl text-[#1D1D1F] leading-snug">
              AppleCare+ offers quick and convenient repair options <br className="hidden sm:inline" />
              with low service fees.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => scrollRepairs('left')}
              className="w-11 h-11 rounded-full bg-[#E8E8ED] hover:bg-[#D2D2D7] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollRepairs('right')}
              className="w-11 h-11 rounded-full bg-[#E8E8ED] hover:bg-[#D2D2D7] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div
          key={`repairs-${selectedCategory}`}
          ref={repairsScrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 apple-smooth-fade"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {getRepairItems(selectedCategory).map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[280px] sm:w-[310px] md:w-[330px] bg-[#F5F5F7] rounded-[28px] p-8 sm:p-9 text-left flex flex-col justify-between space-y-8 border border-[#D2D2D7]/40 hover:bg-[#F2F2F5] transition-all hover:scale-[1.01] shadow-xs"
            >
              <div className="space-y-6">
                <div className="w-12 h-12 flex items-center justify-start">
                  {item.icon}
                </div>
                <h4 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug text-[#1D1D1F]">
                  {item.title}
                </h4>
                <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                  {item.text}
                </p>
              </div>

              {item.fee ? (
                <div className="pt-4 border-t border-[#D2D2D7]/40">
                  <p className="caption typography-body-tight font-semibold text-xs sm:text-sm text-[#1D1D1F]">
                    {item.fee}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Covered from every angle Section */}
      <section className="py-16 bg-[#F5F5F7] border-b border-[#D2D2D7]/60 w-full overflow-hidden">
        <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center space-y-2 max-w-4xl mx-auto px-4">
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1D1D1F] tracking-tight leading-tight">
                Covered from every angle.
              </h3>
            </div>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 lg:gap-8 pb-8 pt-2 px-2 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {BENEFIT_CARDS.map((card) => (
              <div
                key={card.id}
                className="w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[460px] shrink-0 snap-start flex flex-col space-y-5 text-left group"
              >
                <div className="bg-white rounded-[28px] border border-zinc-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center h-[420px] sm:h-[460px] lg:h-[480px] overflow-hidden relative">
                  {card.img2x ? (
                    <picture className="w-full h-full block">
                      <source srcSet={`${card.img2x} 2x`} media="(min-width:0px)" />
                      <img
                        src={card.img}
                        alt={card.alt}
                        className="w-full h-full object-cover rounded-[28px] group-hover:scale-105 transition-transform duration-500"
                      />
                    </picture>
                  ) : (
                    <img
                      src={card.img}
                      alt={card.alt}
                      className="w-full h-full object-cover rounded-[28px] group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        if (card.fallbackImg) {
                          e.currentTarget.src = card.fallbackImg;
                        }
                      }}
                    />
                  )}
                </div>
                <p className="text-sm sm:text-base text-[#1D1D1F] leading-relaxed font-normal px-1">
                  <span className="font-bold">{card.boldText}</span>
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Modal Overlay for All Models (Matching Screenshot 1) */}
      {isPricingModalOpen && (
        <div className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 pt-3 sm:pt-6 pb-3 bg-black/65 backdrop-blur-md sm:backdrop-blur-xl animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="modal-content-container bg-white rounded-[28px] sm:rounded-[36px] max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1380px] w-full h-[94vh] max-h-[96vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 sm:p-12 md:p-16 pt-6 sm:pt-10 relative shadow-2xl space-y-10 animate-in zoom-in-95 duration-200 text-left mt-0">

            <button
              onClick={() => setIsPricingModalOpen(false)}
              className="modal-close-button absolute top-6 right-6 sm:top-8 sm:right-8 w-11 h-11 rounded-full bg-[#E8E8ED] hover:bg-[#D2D2D7] text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 z-20"
              aria-label="Close"
            >
              <span className="modal-close-icon w-5 h-5 text-[#1D1D1F]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.121 10l3.44-3.44a1.5 1.5 0 1 0-2.121-2.12L10 7.878l-3.44-3.44A1.5 1.5 0 1 0 4.44 6.56L7.878 10l-3.44 3.44a1.5 1.5 0 1 0 2.121 2.12L10 12.122l3.44 3.44a1.495 1.495 0 0 0 2.12 0 1.5 1.5 0 0 0 0-2.122L12.12 10z" />
                </svg>
              </span>
            </button>

            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1D1D1F] tracking-tight leading-[1.1] pr-12 -mt-1 sm:-mt-2"
              id={`modal-headline-${selectedCategory.toLowerCase()}`}
            >
              {selectedCategory === 'Mac'
                ? 'AppleCare pricing for all Mac models.'
                : selectedCategory === 'Display'
                  ? 'AppleCare pricing for all display models.'
                  : selectedCategory === 'iPad'
                    ? 'AppleCare pricing for all iPad models.'
                    : selectedCategory === 'Watch'
                      ? 'AppleCare pricing for all Apple Watch models.'
                      : selectedCategory === 'AirPods' || selectedCategory === 'Headphones'
                        ? 'AppleCare pricing for all headphone models.'
                        : selectedCategory === 'TV'
                          ? 'AppleCare pricing for all Apple TV models.'
                          : selectedCategory === 'HomePod'
                            ? 'AppleCare pricing for all HomePod models.'
                            : `Pricing for all ${getDeviceLabel(selectedCategory)} models.`}
            </h2>

            <div className="space-y-14 pt-4 w-full">

              {/* Table 1: AppleCare+ with Theft and Loss (for iPhone) */}
              {(selectedCategory === 'iPhone' || !['Mac', 'Display', 'TV', 'HomePod', 'Watch', 'AirPods'].includes(selectedCategory)) && (
                <div className="container space-y-3 max-w-full w-full">
                  <div className="table flex flex-col w-full">
                    <div className="flex items-center w-full mb-2">
                      <div className="flex-1"></div>
                      <div className="w-44 sm:w-56 text-right pr-0">
                        <p className="header font-bold text-base sm:text-lg text-[#FF2D55] leading-tight whitespace-nowrap">
                          AppleCare+ with Theft and Loss
                        </p>
                      </div>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-lg sm:text-xl border-collapse">
                        <thead>
                          <tr className="text-[#1D1D1F] border-b-2 border-[#D2D2D7]/80">
                            <th className="py-4 font-extrabold text-left pr-6">Models</th>
                            <th className="py-4 font-extrabold text-right pl-2 sm:pl-6 pr-0 w-44 sm:w-56">Annually</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E8ED] text-[#1D1D1F]">
                          <tr>
                            <td className="py-5 font-semibold text-[#1D1D1F] pr-6">iPhone 17e</td>
                            <td className="py-5 text-right font-medium pl-2 sm:pl-6 pr-0">₹9999.00</td>
                          </tr>
                          <tr>
                            <td className="py-5 font-semibold text-[#1D1D1F] pr-6">iPhone 17, iPhone 16</td>
                            <td className="py-5 text-right font-medium pl-2 sm:pl-6 pr-0">₹11499.00</td>
                          </tr>
                          <tr>
                            <td className="py-5 font-semibold text-[#1D1D1F] pr-6">iPhone 16 Plus</td>
                            <td className="py-5 text-right font-medium pl-2 sm:pl-6 pr-0">₹12999.00</td>
                          </tr>
                          <tr>
                            <td className="py-5 font-semibold text-[#1D1D1F] pr-6">iPhone Air, iPhone 17 Pro, iPhone 17 Pro Max</td>
                            <td className="py-5 text-right font-medium pl-2 sm:pl-6 pr-0">₹14499.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Table 2: Standard AppleCare+ (DYNAMIC DATA FROM MONGODB / BACKEND) */}
              <div className="container space-y-3 max-w-full w-full">
                <div className="table flex flex-col w-full">
                  <div className="flex items-center w-full mb-2">
                    <div className="flex-1"></div>
                    <div className="w-44 sm:w-56 text-right pr-0">
                      <p className="header font-bold text-base sm:text-lg text-[#FF2D55] whitespace-nowrap">
                        AppleCare+
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-lg sm:text-xl border-collapse">
                      <thead>
                        <tr className="text-[#1D1D1F] border-b-2 border-[#D2D2D7]/80">
                          <th className="py-4 font-extrabold text-left pr-6">Models</th>
                          <th className="py-4 font-extrabold text-right pl-2 sm:pl-6 pr-0 w-44 sm:w-56">
                            {activeCategoryTable?.durationLabel || (selectedCategory === 'Mac' || selectedCategory === 'TV' || selectedCategory === 'Display' ? '3 years' : '2 years')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E8ED] text-[#1D1D1F]">
                        {activeRows.length > 0 ? (
                          activeRows.map((row, idx) => {
                            let displayPrice = row.yearly || row.salePrice || '11,900.00';
                            const mrpNum = parseFloat(String(row.mrp || row.price || '0').replace(/[^0-9.]/g, '')) || 0;
                            const discNum = parseFloat(String(row.discount || '0').replace(/[^0-9.]/g, '')) || 0;

                            if (mrpNum > 0 && discNum > 0 && discNum <= 99) {
                              const calcPrice = Math.round(mrpNum - (mrpNum * discNum / 100));
                              displayPrice = `₹${calcPrice.toLocaleString('en-IN')}.00`;
                            }

                            const formattedPrice = String(displayPrice).includes('₹')
                              ? displayPrice
                              : `₹${Number(String(displayPrice).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}.00`;

                            return (
                              <tr key={idx}>
                                <td className="py-5 font-semibold text-[#1D1D1F] pr-6">{row.model}</td>
                                <td className="py-5 text-right font-medium pl-2 sm:pl-6 pr-0">{formattedPrice}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="py-5 text-zinc-500 font-medium" colSpan={2}>No active AppleCare+ models found for {selectedCategory}.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            <div className="disclaimer-container space-y-5 pt-4">
              <p className="disclaimer typography-body-reduced-tight text-xs text-[#6E6E73] font-normal">
                For applicable service fees, see terms &amp; conditions.
              </p>
              <div>
                <button
                  onClick={() => setIsPricingModalOpen(false)}
                  className="button bg-[#0071E3] hover:bg-[#0077ED] text-white px-6 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span className="icon-copy">Close pricing table</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
