const reviews = [
  {
    name: "Alex K.",
    role: "Pixel Vault",
    text: "Finally, a platform that doesn't hold my money hostage for 14 days."
  },
  {
    name: "Sarah M.",
    role: "KeyDrop",
    text: "Zero escrow means zero headaches. The UPI integration works flawlessly."
  },
  {
    name: "David R.",
    role: "Gamerz Haven",
    text: "Cleanest storefront builder I've ever used. Set up took minutes."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto" id="wall-of-love">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, idx) => (
          <div 
            key={idx}
            className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm flex flex-col"
          >
            <p className="text-zinc-900 leading-relaxed mb-6 flex-1">
              "{review.text}"
            </p>
            <div>
              <div className="text-sm font-medium text-black">{review.name}</div>
              <div className="text-xs text-zinc-500">{review.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
