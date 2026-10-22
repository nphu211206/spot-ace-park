export const TrustPartnersSection = () => {
  const partners = [
    { name: "Vincom Retail", role: "Hệ thống TTTM toàn quốc" },
    { name: "Vinhomes", role: "Đại đô thị thông minh" },
    { name: "AEON Mall", role: "Trung tâm thương mại Nhật Bản" },
    { name: "VETC", role: "Thu phí không dừng ETC" },
    { name: "Lotte Mart", role: "Trung tâm mua sắm" },
    { name: "ePass VDTC", role: "Giao thông số Viettel" },
  ];

  return (
    <section className="py-14 bg-slate-950 text-white relative border-t border-slate-800/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Hợp tác kết nối cùng các đối tác giao thông & bất động sản hàng đầu
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-center hover:border-slate-700 transition-colors"
            >
              <div className="font-black text-slate-200 text-sm md:text-base">{p.name}</div>
              <div className="text-[11px] text-slate-500 mt-1">{p.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
