import React from 'react'
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const props = {
  name: 'file', 
  action: 'http://20.212.155.179/uploadFile/spc',
  headers: {
    authorization: "authorization-text",
  },

  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

const App = (prop) => {
    const fileChange = (info) => {
        const { status } = info.file;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        //   console.log(info.file.response.fileLoc)
        setTimeout(()=> {
            prop.trigger({
                name: info.file.name,
                size: info.file.size, // bytes
                serverPath: info.file.response.fileLoc,
                lastModified: info.file.lastModified,
                merkle: info.file.response.merkle,
            })
        }, 1300)
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
    }
    return (
        <Dragger {...props} onChange={fileChange}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to upload</p>
        <p className="ant-upload-hint">
            :)
        </p>
      </Dragger>
    )
}

export default App