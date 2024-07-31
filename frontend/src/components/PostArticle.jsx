import React, { useEffect, useRef, useState } from 'react'
import {TextInput,FileInput, Button, Spinner} from 'flowbite-react'
import {Editor} from '@tinymce/tinymce-react'
import axios from 'axios'

import { useSelector } from 'react-redux';
import { FaSave, FaUpload } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';

function PostArticle() {
    const {accessToken} = useSelector(state=>state.user);
    const [uploading,setUploading] = useState(false);
    const [uploadingError,setUploadingError] = useState(null);
    const [title,setTitle] = useState('');
    const [tags,setTags] = useState([]);
    const [coverImage,setCoverImage] = useState(null);
    const [coverImageURL,setCoverImageURL] = useState(null);
    const [description,setDescription] = useState(null);
    const [content,setContent] = useState(null);
    const [formData,setFormData] = useState({});
    const {theme} = useSelector(state=>state.theme);
    const [editorKey,setEditorKey] = useState(0);
    const [editorSkin,setEditorSkin] = useState((theme==='light' ? 'oxide' : 'oxide-dark'));
    const [editorCss,setEditorCss] = useState(theme);
    const coverImagePickerRef = useRef();

    useEffect(()=>{
        setEditorSkin((theme==='light' ? 'oxide' : 'oxide-dark'));
        setEditorCss((theme==='light' ? 'light' : 'dark'));
        setEditorKey(key => key+1);
    },[theme]);

    const uploadArticleHandler = async() => {
        const requestBody = new FormData();
        for(const field in formData){
          requestBody.append(field,formData[field]);
        }
        requestBody.append('coverImage',coverImage);

        try {
          setUploading(true);
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blog/`, requestBody,
            {headers:{
              "Authorization" : `Bearer ${accessToken}`
            }}
          );
          console.log('Data:', response);
        } catch (error) {
          console.log(error);
            setUploading(false);
          if (error.response) {
            // Server responded with a status other than 200 range
            console.log('Error Message:', error.response.data.message);
          } else if (error.request) {
            // Request was made but no response was received
            console.log('Error Request:', error.request);
          } else {
            // Something else happened in making the request
            console.log('Error Message:', error.message);
          }
        }
            
          setUploading(false);
        // }
        // catch(error){
        //   console.log(error);
        //   setUploading(false);
        //   setUploadingError(true);
        // }

    }

  return (
    <div>
      <div className='flex flex-col gap-2'>
      <div className='flex w-full items-center justify-between p-4'>
  <h1 className='font-serif font-bold text-black dark:text-purple-800 text-3xl flex-1 text-center'>
    Article Draft
  </h1>
       <div className='flex gap-2'>
         <Button className='bg-gradient-to-r from-blue-500 to-pink-500 text-white' outline
            disabled = {uploading}
            onClick={()=>{
                setFormData({...formData,isPublished:false})
                uploadArticleHandler()
            }}         
         >
           {uploading ? <Spinner/> : <span><FaSave /> as Draft</span>}
         </Button>
         <Button className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'  outline
          disabled = {uploading}
          onClick={()=>{
            setFormData({...formData,isPublished:true})
            uploadArticleHandler(false)}} 
         >
           {uploading ? <Spinner/> :<span>Publish</span>}
         </Button>
       </div>
     </div>

        <div>   
                <div className='flex w-full items-center'>
                 <h2 className='font-bold'>Cover Image</h2>
                 {coverImageURL ?
                  (
                    <div>
                  <img src={coverImageURL} 
                    alt='coverImage'
                    className='w-[80%] max-h-[70vh]'
                  />
                  <Button gradientDuoTone='pinkToOrange' outline 
                  onClick={()=>{
                    setCoverImage(null);
                    setCoverImageURL(null);
                  }} 
                  >
                    <MdDeleteOutline/>
                  </Button>
                  </div>
                  )
                    : 
                    (
                        <div className="flex m-4 border-2 border-dotted border-blue-600 p-4 gap-4">
                            <Button gradientDuoTone='purpleToBlue' outline className="flex flex-col items-center p-2 rounded cursor-pointer"
                                onClick={()=>coverImagePickerRef.current.click()}
                            >
                                <span className='text-4xl text-blue-700'><FaUpload/></span>
                                <span className=' text-gray-500'>Upload Cover Image</span>
                            </Button>
                            <FileInput
                              type = 'file'
                              accept='image/*'
                              onChange={(e)=>{setCoverImage(e.target.files[0])
                                setCoverImageURL(URL.createObjectURL(e.target.files[0]))
                                e.target.files = null;
                              }}
                              className='hidden'
                              ref={coverImagePickerRef}
                            />
                            <span className='font-bold mx-2'>OR</span>
                            <Button gradientDuoTone='purpleToBlue' outline >
                                Generate via AI
                            </Button>
                        </div>
                    ) 
                }
                </div>

                <div className='flex flex-col'>
                <label htmlFor='title' className='font-bold'>Title</label>
                <div className='flex items-baseline'>
                <textarea 
                    value={title}
                    placeholder='Your Article Title...'
                    onChange={(e)=>{
                        setTitle(e.target.value);
                        setFormData({title:e.target.value,...FormData});
                    }}
                    
                    className='w-full h-max bg-transparent p-4 resize-none m-4 text-3xl font-bold font-serif rounded outline-1 outline-blue-700'
                />
                <Button gradientDuoTone='purpleToBlue' outline className='size-max'>Generate by AI</Button>
                </div>
                </div>

                <div className='w-full'>
                    <label htmlFor='description' className='font-bold'>Description</label>
                    <TextInput 
                        value={description}
                        placeholder='description'
                        onChange={(e)=>{
                            setDescription(e.target.value);
                            setFormData({...formData,description:description})
                            console.log(formData);
                        }}
                        className='w-[90%] ml-4 '
                    />
                </div>
                
                <div className="flex flex-col mt-4">
                <h2 className='font-bold mb-2'>Content</h2>
                <div className='flex w-full justify-center'>
                <div className='outline-1 outline-blue-500'>
                <Editor
                    key={editorKey}
                    value={content}
                    apiKey='9lk9xt3oj76yxw9t6kyeqfl07yqx4njgqrbq5kgevnjlkxos'
                    init={{
                        selector: ['textarea'],
                        menubar:false,
                        toolbar: 'undo redo styles bold italic alignleft aligncenter alignright outdent indent code image',
                        plugins: 'code image',
                        width:900,
                        skin:editorSkin,
                        content_css:theme
                     }}
                    onEditorChange={(data)=>{
                        setContent(data);
                        console.log(content);
                        setFormData(formData => ({...formData,content:content}));
                        console.log(formData);
                    }}
                />
                </div>
                </div>
                    
                </div>

        </div>
      </div>
    </div>
  )
}

export default PostArticle
