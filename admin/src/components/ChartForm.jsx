import { useState } from "react";
import { Form, Select, Input, Button, message } from "antd";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const ChartForm = ({ token: accessToken }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const chartTypes = [
    { value: "bar", label: "Biểu đồ cột" },
    { value: "line", label: "Biểu đồ đường" },
    { value: "pie", label: "Biểu đồ tròn" },
    { value: "scatter", label: "Biểu đồ phân tán" },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/createChart",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;
      message.success("Tạo biểu đồ thành công!");
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          message.error("Unauthorized: Please log in again");
        } else {
          message.error(
            `Có lỗi xảy ra khi tạo biểu đồ: ${error.response.status}`
          );
        }
      } else {
        message.error("Có lỗi xảy ra khi tạo biểu đồ!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Tạo Biểu Đồ Phân Tích Gói Thầu</h2>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="chartType"
          label="Loại biểu đồ"
          rules={[{ required: true, message: "Vui lòng chọn loại biểu đồ!" }]}
        >
          <Select placeholder="Chọn loại biểu đồ">
            {chartTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="prompt"
          label="Prompt lọc gói thầu theo lĩnh vực"
          rules={[{ required: true, message: "Vui lòng nhập prompt!" }]}
        >
          <TextArea
            rows={4}
            placeholder="Ví dụ: 'Dựa vào tiêu đề {title}, trả về CHÍNH XÁC một trong các lĩnh vực sau (chỉ trả về tên lĩnh vực, không thêm bất kỳ từ nào khác): mạng máy tính, data center, an ninh mạng, camera, wifi, khác'"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: 120 }}
          >
            Tạo biểu đồ
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChartForm;
