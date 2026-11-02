const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.147 4.193 4.29-1.124zm11.391-7.147c-.244-.122-1.441-.712-1.664-.793-.223-.081-.386-.122-.549.122-.163.244-.63.793-.772.956-.143.163-.285.183-.529.061-.244-.122-1.034-.381-1.97-1.216-.728-.648-1.22-1.45-1.363-1.694-.143-.244-.015-.376.107-.497.11-.11.244-.285.366-.427.122-.143.163-.244.244-.407.081-.163.041-.305-.02-.427-.061-.122-.549-1.321-.752-1.808-.198-.475-.399-.411-.549-.419-.143-.008-.305-.008-.467-.008s-.427.061-.65.305c-.223.244-.854.834-.854 2.036 0 1.201.874 2.361.996 2.524.122.163 1.72 2.627 4.167 3.684.582.252 1.037.402 1.392.515.584.186 1.116.159 1.536.097.47-.07 1.441-.59 1.644-1.16.203-.57.203-1.058.143-1.16-.062-.101-.224-.162-.468-.284z"/>
  </svg>
);

export default function AIChatWidget() {
  const whatsappUrl = `https://wa.me/918607222417?text=${encodeURIComponent(
    'Hi Rahul, I am visiting iincept Apple Store and need assistance with Apple products and quotes.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-15 sm:h-15 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer border-2 border-white/20 select-none"
      aria-label="Chat on WhatsApp (+91 8607222417)"
      title="Chat on WhatsApp (+91 8607222417)"
    >
      <div className="relative flex items-center justify-center">
        <WhatsAppIcon className="w-8 h-8 text-white drop-shadow-md" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          1
        </span>
      </div>
    </a>
  );
}
