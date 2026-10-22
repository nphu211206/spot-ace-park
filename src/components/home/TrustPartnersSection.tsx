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
    <section className="py-16 bg-[#f4f4f7] text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-8">
          HỢP TÁC KẾT NỐI CÙNG CÁC ĐỐI TÁC GIAO THÔNG & BẤT ĐỘNG SẢN HÀNG ĐẦU
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 transition-colors"
            >
              <div className="text-sm font-bold text-slate-900 mb-1">{p.name}</div>
              <div className="text-[11px] text-slate-500">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
