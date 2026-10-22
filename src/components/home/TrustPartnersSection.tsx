import React from 'react';

export function TrustPartnersSection() {
  const partners = [
    { name: 'Vincom Retail', desc: 'Hệ thống TTTM toàn quốc' },
    { name: 'Vinhomes', desc: 'Đại đô thị thông minh' },
    { name: 'AEON Mall', desc: 'Trung tâm thương mại Nhật Bản' },
    { name: 'VETC', desc: 'Thu phí không dừng ETC' },
    { name: 'Lotte Mart', desc: 'Trung tâm mua sắm' },
    { name: 'ePass VDTC', desc: 'Giao thông số Viettel' },
  ];

  return (
    <section className="py-20 bg-[#0a0a0e] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-xs font-semibold text-[#c9b586] tracking-[0.25em] uppercase mb-10">
          HỢP TÁC KẾT NỐI CÙNG CÁC ĐỐI TÁC GIAO THÔNG & BẤT ĐỘNG SẢN HÀNG ĐẦU
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#c9b586]/30 transition-colors"
            >
              <div className="text-sm font-serif font-medium text-white mb-1">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
