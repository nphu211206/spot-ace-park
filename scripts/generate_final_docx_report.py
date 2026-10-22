import os
import sys
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

from report_helpers import (
    set_cell_background, set_cell_borders, set_cell_padding,
    add_heading_styled, add_body_paragraph, add_bullet_item, add_image_with_caption
)

def create_report():
    doc = Document()

    # --- Page Setup (A4, Standard Margins) ---
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.0)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)

    # Base screenshots folder
    ss_dir = Path(r"E:\Luu_Tru_O_C\spot-ace-park\docs\screenshots")

    # ==========================================
    # TRANG BÌA (COVER PAGE)
    # ==========================================
    p_inst1 = doc.add_paragraph()
    p_inst1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst1.paragraph_format.space_after = Pt(2)
    r = p_inst1.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.bold = True

    p_inst2 = doc.add_paragraph()
    p_inst2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst2.paragraph_format.space_after = Pt(20)
    r = p_inst2.add_run("TRƯỜNG ĐẠI HỌC KINH DOANH VÀ CÔNG NGHỆ HÀ NỘI\nKHOA CÔNG NGHỆ THÔNG TIN")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13.5)
    r.bold = True
    r.font.color.rgb = RGBColor(15, 44, 89)

    # Spacing
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(30)

    p_doc_type = doc.add_paragraph()
    p_doc_type.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_doc_type.paragraph_format.space_after = Pt(12)
    r = p_doc_type.add_run("BÁO CÁO ĐỒ ÁN TỐT NGHIỆP / NGHIÊN CỨU KHOA HỌC")
    r.font.name = "Times New Roman"
    r.font.size = Pt(15)
    r.bold = True
    r.font.color.rgb = RGBColor(220, 38, 38) # Red Accent

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(8)
    r = p_title.add_run("ĐỀ TÀI:")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.bold = True

    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_after = Pt(40)
    r = p_name.add_run("XÂY DỰNG NỀN TẢNG KẾT NỐI MẠNG LƯỚI BÃI ĐỖ XE\nVÀ TRẠM SẠC XE ĐIỆN THÔNG MINH (SPOT ACE PARK)\nỨNG DỤNG DIGITAL TWIN 3D VÀ CÔNG NGHỆ IOT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(17)
    r.bold = True
    r.font.color.rgb = RGBColor(15, 44, 89)

    # Info Box Table
    info_table = doc.add_table(rows=3, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False

    labels = [
        "Giảng viên hướng dẫn:",
        "Nhóm sinh viên thực hiện:",
        "Chuyên ngành đào tạo:"
    ]
    vals = [
        "ThS. Bùi Thu Giang",
        "Nhóm 5 sinh viên (Trưởng nhóm: Nguyễn Phú Toàn - TH29.11)",
        "Công nghệ Thông tin / Kỹ thuật Phần mềm"
    ]

    for i in range(3):
        row = info_table.rows[i]
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.width = Cm(6.5)
        c1.width = Cm(9.5)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(4)
        r0 = p0.add_run(labels[i])
        r0.font.name = "Times New Roman"
        r0.font.size = Pt(12)
        r0.bold = True
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(4)
        r1 = p1.add_run(vals[i])
        r1.font.name = "Times New Roman"
        r1.font.size = Pt(12)
        
        set_cell_borders(c0, color="FFFFFF", sz="0")
        set_cell_borders(c1, color="FFFFFF", sz="0")

    p_bottom = doc.add_paragraph()
    p_bottom.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bottom.paragraph_format.space_before = Pt(80)
    r = p_bottom.add_run("Hà Nội, Năm 2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12.5)
    r.bold = True

    doc.add_page_break()

    # ==========================================
    # BẢNG THÔNG TIN 5 THÀNH VIÊN VÀ ĐIỂM ĐÓNG GÓP
    # ==========================================
    add_heading_styled(doc, "BẢNG PHÂN CÔNG NHIỆM VỤ VÀ ĐÁNH GIÁ ĐÓNG GÓP CỦA THÀNH VIÊN", level=1)
    
    add_body_paragraph(doc, 
        "Dưới đây là bảng phân chia công việc chi tiết và mức độ hoàn thành nhiệm vụ của 5 thành viên trong nhóm tham gia nghiên cứu và xây dựng đề tài Spot Ace Park:"
    )

    members_data = [
        ("1", "Nguyễn Phú Toàn", "TH29.11", "Trưởng nhóm\nFullstack Dev", 
         "Quản lý dự án, thiết kế kiến trúc toàn diện, xây dựng Digital Twin 3D (Three.js WebGL), viết Mock API Engine và tích hợp toàn hệ thống.", "100%", "10.0"),
        ("2", "Khổng Văn Đền", "TH29.19", "Backend Dev\nDB Admin", 
         "Thiết kế cơ sở dữ liệu SQL Server, xây dựng các endpoint quản lý đặt chỗ (Bookings), bãi xe (Parking Lots), cơ chế xác thực và phân quyền.", "95%", "9.5"),
        ("3", "Nguyễn Quốc Đại", "TH29.20", "Frontend Dev", 
         "Phát triển giao diện React TypeScript, tối ưu hóa các hiệu ứng tương tác (Framer Motion), thiết kế responsive trên đa thiết bị.", "95%", "9.5"),
        ("4", "Trần Văn Nam", "TH29.15", "IoT & Testing", 
         "Nghiên cứu tích hợp cảm biến IoT mô phỏng Barrier tự động, module Camera Scanner vé QR/OCR biển số và kiểm thử tự động hệ thống.", "90%", "9.0"),
        ("5", "Lê Thị Thu Trang", "TH29.08", "UI/UX & Tester\nDocument", 
         "Thiết kế Wireframe & UI/UX trên Figma, kiểm thử trải nghiệm người dùng, chuẩn bị nội dung tài liệu báo cáo và slide thuyết trình.", "90%", "9.0")
    ]

    table = doc.add_table(rows=1, cols=7)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    headers = ["STT", "Họ và tên", "Mã SV / Lớp", "Vai trò", "Nhiệm vụ chính phụ trách", "Tỷ lệ\nđóng góp", "Điểm số\n(/10)"]
    col_widths = [Cm(1.0), Cm(3.2), Cm(2.2), Cm(2.5), Cm(5.0), Cm(1.6), Cm(1.5)]

    # Header Row
    hdr_cells = table.rows[0].cells
    for idx, text in enumerate(headers):
        hdr_cells[idx].width = col_widths[idx]
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10.5)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(hdr_cells[idx], "0F2C59")
        set_cell_padding(hdr_cells[idx], top=120, bottom=120, left=100, right=100)
        set_cell_borders(hdr_cells[idx], color="0F2C59", sz="6")

    # Data Rows
    for row_idx, data in enumerate(members_data):
        row = table.add_row()
        cells = row.cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(data):
            cells[c_idx].width = col_widths[c_idx]
            p = cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            
            # Alignments
            if c_idx in [0, 2, 5, 6]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)
            if c_idx == 1:
                r.bold = True
            if c_idx == 6:
                r.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129) # Emerald Green
                
            set_cell_background(cells[c_idx], bg_color)
            set_cell_padding(cells[c_idx], top=100, bottom=100, left=100, right=100)
            set_cell_borders(cells[c_idx], color="CBD5E1", sz="4")

    add_body_paragraph(doc, 
        "Nhận xét chung của nhóm: Tất cả các thành viên đều hoàn thành tốt các hạng mục công việc được phân công, có tinh thần trách nhiệm cao, chủ động giải quyết các vướng mắc kỹ thuật và phối hợp chặt chẽ trong suốt quá trình triển khai đề tài."
    )

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI VÀ KIẾN TRÚC HỆ THỐNG
    # ==========================================
    add_heading_styled(doc, "CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI VÀ KIẾN TRÚC HỆ THỐNG", level=1)
    
    add_heading_styled(doc, "1.1. Tính cấp thiết của đề tài", level=2)
    add_body_paragraph(doc, 
        "Tại các đô thị lớn ở Việt Nam như Hà Nội và TP.HCM, quá trình đô thị hóa diễn ra nhanh chóng kéo theo sự bùng nổ của phương tiện giao thông cá nhân (ô tô, xe máy). Tuy nhiên, quỹ đất dành cho giao thông tĩnh chỉ đáp ứng được dưới 10% nhu cầu thực tế. Tình trạng tài xế phải chạy vòng quanh tìm kiếm chỗ đỗ xe không chỉ gây lãng phí thời gian, tiêu hao nhiên liệu mà còn là nguyên nhân trực tiếp dẫn tới ùn tắc giao thông cục bộ và ô nhiễm môi trường."
    )
    add_body_paragraph(doc, 
        "Bên cạnh đó, làn sóng chuyển dịch sang phương tiện giao thông xanh (xe điện - EV) đang bùng nổ mạnh mẽ tại Việt Nam. Nhu cầu kết hợp giữa việc đỗ xe và sạc điện thông minh (Park & Charge) trở thành một bài toán cấp thiết. Người dùng thường xuyên gặp khó khăn khi tìm bãi đỗ xe có sẵn trụ sạc tương thích và không nắm được tình trạng hoạt động của trụ sạc theo thời gian thực."
    )
    add_body_paragraph(doc, 
        "Hệ thống Spot Ace Park được ra đời nhằm giải quyết toàn diện bài toán trên bằng cách kết nối mạng lưới các bãi đỗ xe và trạm sạc trên một nền tảng phần mềm thống nhất, tích hợp công nghệ Digital Twin 3D và điều khiển IoT thông minh."
    )

    add_heading_styled(doc, "1.2. Mục tiêu nghiên cứu và giải pháp đề xuất", level=2)
    add_bullet_item(doc, "Đối với người dùng", "Tìm kiếm bãi đỗ xe theo điểm đến, đặt chỗ trước có điều kiện, quan sát trực quan sơ đồ bãi đỗ 3D theo thời gian thực và thanh toán tự động qua mã QR.")
    add_bullet_item(doc, "Đối với chủ xe điện (EV)", "Tìm kiếm ô đỗ tích hợp trụ sạc, kiểm tra chuẩn sạc tương thích (Type 2, CCS2), theo dõi tiến trình sạc và thanh toán gộp một lần.")
    add_bullet_item(doc, "Đối với ban quản lý bãi xe", "Giám sát lưu lượng xe ra vào, tỉ lệ lấp đầy bãi xe, tự động hóa đóng mở Barrier qua nhận diện vé/biển số xe, cảnh báo quá tải.")
    add_bullet_item(doc, "Đối với quản trị viên hệ thống", "Theo dõi biểu đồ doanh thu thời gian thực, quản lý phân quyền người dùng, điều phối tài nguyên và thiết lập thuật toán tính giá linh hoạt (Dynamic Pricing).")

    add_heading_styled(doc, "1.3. Kiến trúc kỹ thuật của hệ thống", level=2)
    add_body_paragraph(doc, 
        "Hệ thống Spot Ace Park được xây dựng theo mô hình kiến trúc phân tầng hiện đại (Layered Architecture) nhằm đảm bảo tính độc lập, khả năng mở rộng và độ ổn định cao:"
    )
    add_bullet_item(doc, "Tầng Giao diện (Frontend Client)", "Xây dựng trên nền tảng React 18, Vite 5, TypeScript và Tailwind CSS. Kết hợp thư viện đồ họa Three.js (@react-three/fiber, @react-three/drei) để dựng mô hình Digital Twin 3D mô phỏng không gian bãi đỗ.")
    add_bullet_item(doc, "Tầng Xử lý nghiệp vụ & API (Backend Services)", "Phát triển bằng Node.js với mô hình Restful API chuẩn mực. Hệ thống tích hợp song song 2 cơ chế: (1) Mock Service Engine độc lập chạy in-memory giúp vận hành trơn tru trên mọi máy tính mà không phụ thuộc DB ngoài; (2) Kết nối cơ sở dữ liệu quan hệ SQL Server / Supabase Cloud khi triển khai thực tế.")
    add_bullet_item(doc, "Tầng Tương tác ngoại vi (IoT & Vision Engine)", "Tích hợp thư viện xử lý ảnh (Tesseract.js OCR / Quagga QR Scanner) cho phép biến camera thiết bị thành máy quét vé thông minh, kết nối mô phỏng tín hiệu điều khiển Barrier và Sensor đỗ xe.")

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 2: BÁO CÁO CHI TIẾT CÁC TÍNH NĂNG VÀ HÌNH ẢNH MINH HỌA
    # ==========================================
    add_heading_styled(doc, "CHƯƠNG 2: CHI TIẾT CÁC TÍNH NĂNG VÀ HÌNH ẢNH MINH HỌA", level=1)
    add_body_paragraph(doc, 
        "Dưới đây là báo cáo toàn bộ các tính năng cốt lõi của hệ thống Spot Ace Park kèm 16 hình ảnh chụp thực tế từ quá trình vận hành trực tiếp của dự án:"
    )

    # 1. Trang chủ
    add_heading_styled(doc, "2.1. Phân hệ Khách hàng - Trang chủ và Giới thiệu (Landing Page)", level=2)
    add_body_paragraph(doc, 
        "Trang chủ là điểm chạm đầu tiên của người dùng với hệ thống, được thiết kế theo phong cách hiện đại (Dark Mode, hiệu ứng phát sáng neon và typography sắc nét). Giao diện cung cấp thông điệp giá trị cốt lõi của Spot Ace Park, thanh tìm kiếm bãi xe tức thì và các số liệu thống kê nổi bật về mạng lưới."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_01_trang_chu.png",
        "Hình 1: Giao diện Trang chủ (Landing Page) Spot Ace Park",
        "Hiển thị khẩu hiệu định vị thương hiệu, giới thiệu công nghệ đỗ xe thông minh và các nút kêu gọi hành động (Call To Action) hướng dẫn người dùng đặt chỗ ngay."
    )

    # 2 & 3. Auth (Login / Signup)
    add_heading_styled(doc, "2.2. Phân hệ Xác thực & Phân quyền Người dùng (Authentication & Authorization)", level=2)
    add_body_paragraph(doc, 
        "Hệ thống xác thực được bảo mật chặt chẽ, hỗ trợ hai phương thức đăng nhập và đăng ký tài khoản mới bằng số điện thoại. Đặc biệt, hệ thống tích hợp cơ chế cấp quyền quản trị viên thông qua Mã kích hoạt bí mật (Admin Secret Code: SPOT_ACE_MASTER), giúp phân tách rõ ràng quyền hạn giữa Khách hàng và Quản trị viên."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_02_dang_nhap.png",
        "Hình 2: Giao diện Đăng nhập hệ thống",
        "Cho phép người dùng hoặc quản trị viên đăng nhập nhanh bằng số điện thoại và mật khẩu với cơ chế ghi nhớ phiên làm việc trên LocalStorage."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_03_dang_ky.png",
        "Hình 3: Giao diện Đăng ký tài khoản người dùng mới",
        "Cung cấp form nhập thông tin họ tên, số điện thoại, mật khẩu và ô nhập Mã xác thực Admin để phân quyền tài khoản ngay từ khi khởi tạo."
    )

    # 4. Danh sách bãi xe
    add_heading_styled(doc, "2.3. Phân hệ Tra cứu & Lọc bãi đỗ xe thông minh", level=2)
    add_body_paragraph(doc, 
        "Người dùng có thể tra cứu toàn bộ mạng lưới các bãi đỗ xe liên kết (ví dụ: Vincom Center Đồng Khởi, Landmark 81 Smart Parking). Danh sách hiển thị trực quan thông tin về sức chứa, số chỗ còn trống thời gian thực, đơn giá cơ bản và các tiện ích đi kèm (Trạm sạc EV, Camera an ninh 24/7, Đỗ xe có mái che, v.v.)."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_04_danh_sach_bai_xe.png",
        "Hình 4: Danh sách bãi đỗ xe thông minh trong mạng lưới",
        "Hiển thị thẻ bãi xe với các chỉ số chỗ trống theo thời gian thực, giá vé và bộ lọc tiện ích giúp tài xế lựa chọn điểm đỗ phù hợp nhất."
    )

    # 5 & 6. 3D Digital Twin
    add_heading_styled(doc, "2.4. Công nghệ Đột phá: Mô phỏng không gian 3D Digital Twin", level=2)
    add_body_paragraph(doc, 
        "Đây là tính năng độc đáo và vượt trội nhất của dự án. Thay vì sơ đồ 2D phẳng thông thường, Spot Ace Park ứng dụng công nghệ WebGL (Three.js) để xây dựng bản sao kỹ thuật số 3D của bãi đỗ xe. Người dùng có thể xoay góc nhìn 360 độ, phóng to, thu nhỏ và tương tác trực tiếp với từng ô đỗ xe."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_05_digital_twin_3d_toan_canh.png",
        "Hình 5: Toàn cảnh không gian 3D Digital Twin của bãi đỗ xe",
        "Mô hình 3D trực quan hóa layout bãi đỗ, phân luồng xe chạy, khu vực đỗ xe tiêu chuẩn và khu vực đỗ xe ưu tiên tích hợp trụ sạc điện."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_06_digital_twin_3d_chon_slot.png",
        "Hình 6: Tương tác chọn vị trí ô đỗ trực tiếp trên mô hình 3D",
        "Khi người dùng click vào một ô đỗ (ví dụ ô A01), hệ thống làm nổi bật vị trí, hiển thị trạng thái khả dụng và chuyển tiếp thông tin sang bước đặt chỗ."
    )

    # 7 & 8. Booking Page & Payment
    add_heading_styled(doc, "2.5. Quy trình Đặt chỗ & Cổng thanh toán trực tuyến", level=2)
    add_body_paragraph(doc, 
        "Sau khi chọn vị trí đỗ, người dùng được chuyển đến giao diện thiết lập thông tin đặt chỗ: nhập biển số phương tiện, chọn thời gian bắt đầu và thời lượng đỗ xe dự kiến. Hệ thống tự động áp dụng công thức tính giá linh hoạt để đưa ra mức phí chính xác. Cổng thanh toán tích hợp hỗ trợ đa dạng phương thức (Mã QR chuyển khoản, ví điện tử Momo, VNPAY, thẻ quốc tế)."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_07_chi_tiet_dat_cho.png",
        "Hình 7: Giao diện thiết lập thông tin đặt chỗ đỗ xe",
        "Cho phép tùy chỉnh thời gian vào bãi, thời lượng đỗ (theo giờ/ngày) và tính toán tổng chi phí dịch vụ tự động."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_08_cong_thanh_toan.png",
        "Hình 8: Cổng thanh toán trực tuyến tích hợp",
        "Giao diện lựa chọn phương thức thanh toán an toàn, hiển thị mã QR động và nút xác nhận hoàn tất giao dịch."
    )

    # 9 & 10. Bookings & QR Ticket
    add_heading_styled(doc, "2.6. Quản lý Vé đỗ & Vé điện tử Check-in bằng mã QR", level=2)
    add_body_paragraph(doc, 
        "Ngay khi thanh toán thành công, hệ thống sinh ra một vé điện tử duy nhất gắn liền với mã định danh giao dịch. Người dùng có thể xem lại toàn bộ lịch sử các chuyến đỗ xe tại trang Quản lý đặt chỗ. Mỗi vé đều đi kèm mã QR Code độ phân giải cao dùng để quét qua máy đọc tại Barrier khi ra/vào bãi xe."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_09_lich_su_dat_cho.png",
        "Hình 9: Trang Quản lý vé và Lịch sử đặt chỗ của người dùng",
        "Hiển thị danh sách các lượt đặt xe đang hoạt động (Confirmed) và các lượt đặt xe đã hoàn thành (Completed)."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_10_chi_tiet_ve_qr.png",
        "Hình 10: Chi tiết vé điện tử kèm mã QR Code Check-in",
        "Chứa đầy đủ thông tin: Biển số xe, vị trí ô đỗ, thời gian hiệu lực, tổng chi phí và mã QR phục vụ quét tự động tại barrier thông minh."
    )

    # 11 & 12. EV Charging
    add_heading_styled(doc, "2.7. Phân hệ Mạng lưới Trạm sạc xe điện (EV Charging Network)", level=2)
    add_body_paragraph(doc, 
        "Hỗ trợ chuyên biệt cho tài xế xe điện với bản đồ mạng lưới trạm sạc. Mỗi trạm sạc hiển thị chi tiết các chuẩn kết nối (Type 2 sạc thường AC, CCS2 sạc nhanh DC), công suất tối đa (22kW, 60kW, 120kW), biểu giá điện theo kWh và cho phép tài xế thiết lập phiên sạc kết hợp đỗ xe thông minh."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_11_mang_luoi_tram_sac.png",
        "Hình 11: Mạng lưới trạm sạc xe điện EV Charging thông minh",
        "Danh sách các điểm sạc điện tử với trạng thái khả dụng của từng trụ sạc, thông số công suất và đơn giá nạp năng lượng."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_12_dat_lich_sac_ev.png",
        "Hình 12: Thiết lập phiên sạc xe điện kết hợp đỗ xe (Park & Charge)",
        "Giao diện cho phép chọn dung lượng pin cần nạp, ước tính thời gian hoàn thành phiên sạc và chi phí điện năng tiêu thụ."
    )

    # 13. Scanner
    add_heading_styled(doc, "2.8. Phân hệ Quét vé thông minh (Scanner & Computer Vision)", level=2)
    add_body_paragraph(doc, 
        "Phân hệ Scanner được trang bị cho nhân viên kiểm soát bãi xe hoặc tích hợp trực tiếp vào camera của Barrier tự động. Sử dụng thuật toán nhận diện quang học (OCR / QR Decoding) để quét mã vé trên điện thoại của tài xế hoặc nhận diện biển số xe tự động, cho phép mở barrier trong thời gian dưới 1 giây."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_13_quet_ve_scanner.png",
        "Hình 13: Giao diện Scanner quét mã vé QR và nhận diện biển số",
        "Tích hợp luồng camera trực tiếp với khung ngắm nhận diện thông minh, tự động kích hoạt sự kiện kiểm tra vé hợp lệ."
    )

    # 14. Manager Dashboard
    add_heading_styled(doc, "2.9. Bảng điều khiển Quản lý bãi xe (Manager Dashboard)", level=2)
    add_body_paragraph(doc, 
        "Dành cho người phụ trách vận hành tại từng bãi đỗ xe cục bộ. Cung cấp góc nhìn giám sát trực tiếp luồng xe ra vào, nhận diện sự kiện cảm biến IoT theo thời gian thực (ví dụ xe vừa đỗ vào ô A01, phát hiện đỗ sai vị trí) và điều khiển cưỡng bức Barrier khi có tình huống khẩn cấp."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_14_manager_dashboard.png",
        "Hình 14: Bảng điều khiển Quản lý bãi xe (Manager Dashboard)",
        "Giám sát lưu lượng xe thời gian thực, bảng nhật ký sự kiện cảm biến IoT và trạng thái vận hành của các thiết bị phần cứng."
    )

    # 15 & 16. Admin Dashboard & IoT Jarvis
    add_heading_styled(doc, "2.10. Phân hệ Quản trị hệ thống cấp cao (Admin Dashboard & IoT Control)", level=2)
    add_body_paragraph(doc, 
        "Dành cho ban giám đốc hoặc quản trị viên toàn bộ mạng lưới Spot Ace Park. Giao diện tích hợp hệ thống phân tích dữ liệu chuyên sâu với các biểu đồ trực quan (Recharts): Biểu đồ doanh thu 24 giờ qua, biểu đồ lưu lượng xe, biểu đồ radar đánh giá sức khỏe hệ thống phần cứng (CPU, RAM, Network, Disk). Ngoài ra, hệ thống còn tích hợp Trợ lý AI Jarvis tự động đưa ra khuyến nghị điều phối tài nguyên."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_15_admin_dashboard_tong_quan.png",
        "Hình 15: Bảng điều khiển Quản trị viên (Admin Analytics Dashboard)",
        "Biểu đồ phân tích doanh thu 24h, biểu đồ radar giám sát hạ tầng máy chủ và các chỉ số KPI vận hành toàn hệ thống."
    )
    add_image_with_caption(doc, ss_dir / "screenshot_16_admin_control_iot_jarvis.png",
        "Hình 16: Bảng điều khiển thiết bị IoT ngoại vi và Trợ lý AI Jarvis",
        "Cho phép can thiệp trực tiếp trạng thái Barrier tự động, Camera an ninh và nhận gợi ý tối ưu hóa doanh thu từ trợ lý AI."
    )

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 3: HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH (DÀNH CHO THẦY CÔ)
    # ==========================================
    add_heading_styled(doc, "CHƯƠNG 3: HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG", level=1)
    add_body_paragraph(doc, 
        "Để tạo điều kiện thuận lợi nhất cho Thầy/Cô trong quá trình chấm thi và đánh giá đồ án, nhóm đã đóng gói hệ thống theo cơ chế Zero-Configuration (Tự động hóa hoàn toàn 1-Click), không đòi hỏi Thầy/Cô phải cài đặt các hệ quản trị cơ sở dữ liệu phức tạp."
    )

    add_heading_styled(doc, "3.1. Yêu cầu môi trường tối thiểu", level=2)
    add_bullet_item(doc, "Hệ điều hành", "Hỗ trợ toàn diện Windows 10/11, macOS, Linux.")
    add_bullet_item(doc, "Môi trường Runtime", "Đã cài đặt sẵn Node.js (phiên bản 18 LTS hoặc 20 LTS trở lên) và npm.")
    add_bullet_item(doc, "Trình duyệt web khuyến nghị", "Google Chrome, Microsoft Edge, Safari hoặc Mozilla Firefox (bản mới nhất hỗ trợ WebGL).")

    add_heading_styled(doc, "3.2. Hướng dẫn khởi chạy 1-Click (Dành cho máy Windows)", level=2)
    add_body_paragraph(doc, 
        "Thầy/Cô chỉ cần thực hiện đúng 2 bước đơn giản sau:"
    )
    add_bullet_item(doc, "Bước 1", "Giải nén thư mục đồ án vào ổ đĩa bất kỳ trên máy tính.")
    add_bullet_item(doc, "Bước 2", "Bấm đúp chuột (Double-click) vào file 'start.bat' nằm ngay tại thư mục gốc của dự án.")
    add_body_paragraph(doc, 
        "Ngay lập tức, file kịch bản 'start.bat' sẽ tự động kiểm tra thư viện, khởi động Mock API Server độc lập trên cổng 3000, bật máy chủ giao diện Vite trên cổng 5173 và tự động mở trình duyệt web hiển thị trang chủ Spot Ace Park."
    )

    add_heading_styled(doc, "3.3. Danh sách tài khoản kiểm thử sẵn có trong hệ thống", level=2)
    add_body_paragraph(doc, 
        "Hệ thống đã nạp sẵn các tài khoản mẫu sau để Thầy/Cô có thể trải nghiệm toàn diện các vai trò người dùng khác nhau:"
    )

    acc_table = doc.add_table(rows=1, cols=4)
    acc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    acc_table.autofit = False

    acc_headers = ["Vai trò truy cập", "Số điện thoại / Tên đăng nhập", "Mật khẩu", "Quyền hạn truy cập"]
    acc_widths = [Cm(3.5), Cm(5.0), Cm(3.0), Cm(5.0)]

    hdr_cells = acc_table.rows[0].cells
    for idx, text in enumerate(acc_headers):
        hdr_cells[idx].width = acc_widths[idx]
        p = hdr_cells[idx].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(10.5)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_background(hdr_cells[idx], "1E40AF")
        set_cell_padding(hdr_cells[idx], top=100, bottom=100, left=100, right=100)
        set_cell_borders(hdr_cells[idx], color="1E40AF", sz="6")

    accounts_data = [
        ("Khách hàng (User)", "0900000000", "123456", "Xem bãi xe, tương tác Digital Twin 3D, đặt chỗ, thanh toán, xem vé QR, xem trạm sạc."),
        ("Quản trị viên (Admin)", "admin", "211206", "Truy cập toàn bộ hệ thống, xem Admin Analytics Dashboard, điều khiển IoT Barrier, giám sát hệ thống."),
        ("Đăng ký tài khoản mới", "Tự do nhập SĐT mới", "Tự do nhập MK", "Mã kích hoạt Admin bí mật: SPOT_ACE_MASTER (nếu muốn tạo thêm Admin mới).")
    ]

    for row_idx, row_data in enumerate(accounts_data):
        row = acc_table.add_row()
        cells = row.cells
        bg_col = "F1F5F9" if row_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cells[c_idx].width = acc_widths[c_idx]
            p = cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            if c_idx in [1, 2]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10)
            if c_idx in [0, 1]:
                r.bold = True
            set_cell_background(cells[c_idx], bg_col)
            set_cell_padding(cells[c_idx], top=100, bottom=100, left=100, right=100)
            set_cell_borders(cells[c_idx], color="CBD5E1", sz="4")

    doc.add_page_break()

    # ==========================================
    # CHƯƠNG 4: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # ==========================================
    add_heading_styled(doc, "CHƯƠNG 4: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", level=1)
    
    add_heading_styled(doc, "4.1. Đánh giá kết quả đạt được", level=2)
    add_body_paragraph(doc, 
        "Sau thời gian nghiêm túc nghiên cứu và triển khai, nhóm đã hoàn thành xuất sắc các mục tiêu đề ra cho dự án Spot Ace Park:"
    )
    add_bullet_item(doc, "Về mặt công nghệ", "Ứng dụng thành công công nghệ WebGL Three.js vào bài toán thực tiễn đô thị thông minh, tạo ra trải nghiệm 3D Digital Twin trực quan, mượt mà trên nền web.")
    add_bullet_item(doc, "Về mặt tính năng", "Xây dựng hoàn chỉnh chu trình khép kín: Tìm kiếm bãi xe ➔ Chọn vị trí 3D ➔ Đặt chỗ ➔ Thanh toán ➔ Cấp mã vé QR ➔ Quét Scanner kiểm soát ra vào ➔ Tích hợp trạm sạc xe điện EV ➔ Bảng điều khiển quản trị phân tích số liệu thời gian thực.")
    add_bullet_item(doc, "Về tính tiện dụng", "Đóng gói giải pháp gọn nhẹ, tính độc lập cao, hỗ trợ chạy mượt mà trên đa nền tảng thiết bị.")

    add_heading_styled(doc, "4.2. Hướng phát triển trong tương lai", level=2)
    add_bullet_item(doc, "Tích hợp AI Camera thực tế", "Kết nối trực tiếp với luồng video RTSP từ camera IP tại các bãi xe để nhận diện biển số tự động (ALPR) với độ chính xác cao trong mọi điều kiện thời tiết.")
    add_bullet_item(doc, "Thuật toán Định giá động (Dynamic AI Pricing)", "Áp dụng học máy (Machine Learning) phân tích dữ liệu lịch sử và các sự kiện đô thị xung quanh để tự động tối ưu hóa giá vé theo thời gian thực.")
    add_bullet_item(doc, "Phát triển ứng dụng di động Native (Mobile App)", "Đóng gói ứng dụng trên React Native / Flutter để hỗ trợ dẫn đường thời gian thực (Turn-by-turn Navigation) và thanh toán một chạm qua Apple Pay / Google Wallet.")

    # Save documents to target paths
    out_docs_path = Path(r"E:\Luu_Tru_O_C\spot-ace-park\docs\Bao_Cao_Do_An_Spot_Ace_Park.docx")
    out_desktop_path = Path(r"C:\Users\Admin\Desktop\Bao_Cao_Do_An_Spot_Ace_Park.docx")

    out_docs_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out_docs_path))
    print(f"[SUCCESS] Report saved to: {out_docs_path}")

    try:
        doc.save(str(out_desktop_path))
        print(f"[SUCCESS] Copy also saved to Desktop: {out_desktop_path}")
    except Exception as e:
        print(f"[NOTE] Could not save to Desktop directly: {e}")

if __name__ == "__main__":
    create_report()
