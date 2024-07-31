import { Button, TextInput,Modal, Alert, Spinner} from 'flowbite-react'
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {MdDelete, MdOutlineDelete} from 'react-icons/md'
import { updateFailure, updateStart, updateSuccess } from '../redux/User/userSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function ProfileSetting() {
    const {currentUser} = useSelector(state => state.user);
    const [fullName,setFullName] = useState(currentUser.fullName);
    const [username,setUsername] = useState(currentUser.username);
    const [bio,setBio] = useState(currentUser.bio);
    const [imageFile,setImageFile] = useState(null);
    const[avatar,setAvatar] = useState(currentUser.avatar);
    const [deleteCurrentAvatar,setDeleteCurrentAvatar] = useState(false);
    const [tagline,setTagline] = useState(currentUser.tagline || "");
    const [links,setLinks] = useState(currentUser.links || []);
    const [openAddLinkModal,setOpenAddLinkModal] = useState(false);
    const [selectedLinkType,setSelectedLinkType] = useState('');
    const [addLinkURL,setAddLinkURL] = useState('');
    const [addLinkError,setAddLinkError] = useState(null);
    const imagePickerRef = useRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {loading,error,accessToken} = useSelector((state) => state.user);

    const handleUpdateProfile = async() => {
  
        dispatch(updateStart());
        const requestBody = new FormData();
        requestBody.append('fullName',fullName);
        requestBody.append('username',username);
        requestBody.append('tagline',tagline);
        requestBody.append('bio',bio);
        requestBody.append('links',links);
        requestBody.append('avatar',imageFile);
        requestBody.append('deleteCurrentAvatar',deleteCurrentAvatar);
        console.log("The request is- ",requestBody);

        const res = axios({
          url:'http://localhost:4000/api/v1/users/update-details',
          data:requestBody,
          method:'post',
          headers:{
            'Authorization' : `Bearer ${accessToken}`}
        })
        .then((res)=>{
          console.log(res.data.data.user);
          dispatch(updateSuccess(res.data.data.user));
          navigate('/dashboard?tab=profile');
        })
        .catch((error)=>(dispatch(updateFailure(error))));

      }
    
    const handleImageChange = async(e) => {
      const file = e.target.files[0];
      console.log(imageFile);
      if(file){
        setImageFile(file);
        setAvatar(URL.createObjectURL(file));
      } 
    }

  return (
    <div>
      <div className="w-full flex flex-col gap-6">

          
         <div>
          <h2 className='text-2xl font-bold'>Basic Info</h2>
          <div className='border-b-2 mt-1 mb-2 border-b-yellow-300 w-20'></div>
          
            <div className="flex flex-col w-full gap-2">

            <div>
            <label htmlFor='id' className='font-bold'>Full Name</label>
            <TextInput 
                id='fullName'
                placeholder='your full name'
                value={fullName}
                onChange={(e)=>setFullName(e.target.value)}
                className='mt-1 mb-4 w-[80%] md:w-[60%]'
            />
            </div>

            <div>
            <label htmlFor='id' className='font-bold'>Username</label>
            <TextInput 
                id='username'
                placeholder='your username'
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                className='mt-1 mb-4 w-[80%] md:w-[60%]'
            />
            </div>


          <div>
            <input
             type='file'
             accept='image/*'
             onChange={handleImageChange}
             ref={imagePickerRef}
             disabled = {avatar}
             hidden
            />
            <div className='flex'>
              <div  className='relative w-36 h-36 self-center cursor-pointer shadow-md overflow-hidden rounded-full'
              onClick={() => imagePickerRef.current.click()}
              >
                <img
                 src={avatar || './assets/uploadImage.png'}
                 alt='User Image'
                 className='rounded-full w-full h-full object-cover border-2 border-[lightgray]'
                />
              </div>

              <div>
                {avatar && <Button className='w-8 h-8 rounded-full outline'
                    onClick={()=>{
                      setAvatar(avatar => null);
                      setImageFile(imageFile => null);
                      setDeleteCurrentAvatar(true);
                      imagePickerRef.current.value = '';
                    }}
                  >
                  <MdOutlineDelete/>
                </Button>}
              </div>

            </div>

            </div>
            </div>

          {/* end of basic info section */}

            <div>
              <h2 className='text-2xl font-bold'>About me</h2>
              <div className='border-b-2 mt-1 mb-2 border-b-yellow-300 w-32'></div>
              <div>
                <label>Tagline</label>
                <TextInput
                  id='tagline'
                  value={tagline}
                  placeholder='Your Tagline'
                  onChange={(e)=>setTagline(e.target.value)}
                  className='mt-1 mb-4 w-[80%] md:w-[60%]'
                />
              </div>

              <div>
                <label>Bio</label>
                <TextInput
                  id='bio'
                  value={bio}
                  placeholder='My Bio...'
                  onChange={(e)=>setBio(e.target.value)}
                  className='mt-1 mb-4 w-[80%] md:w-[60%]'
                  // height={100}
                />
              </div>
            </div>

          {/* end of about me section */}

          <div>
          <h2 className='text-2xl font-bold'>Links</h2>
          <div className='border-b-2 mt-1 mb-2 border-b-yellow-300 w-20'></div>
          <Button className='outline' 
          onClick={()=>
            {setOpenAddLinkModal(true);
             setAddLinkError(false);
          }}>Add Link</Button>
          <Modal dismissible show={openAddLinkModal} onClose={() => setOpenAddLinkModal(false)}>
            <Modal.Header>Add Link</Modal.Header>
            <Modal.Body>
              <div>
                 <div className='text-red-600'>
                  {addLinkError}
                 </div>

                <div className="flex">

                  <select
                      id="profile-link-select"
                      value={selectedLinkType}
                      onChange={(e) => {
                        setSelectedLinkType(e.target.value)
                        setAddLinkError(false);
                      }}
                      className="block w-[20%] mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="" disabled>Select an option</option>
                      <option value="github">Github</option>
                      <option value="linkedIn">LinkedIn</option>
                      <option value="youtube">YouTube</option>
                      <option value="leetcode">LeetCode</option>
                      <option value="codeforces">CodeForces</option>
                      <option value="codechef">CodeChef</option>
                      <option value="hashnode">Hashnode</option>
                      <option value="website">Website</option>
                    </select>

                  <TextInput
                    value={addLinkURL}
                    onChange={(e)=>{
                      setAddLinkURL(e.target.value);
                      setAddLinkError(false);
                    }}
                    placeholder={`https://www.${ selectedLinkType.toLowerCase() || "site"}.com/username`}
                    disabled = {selectedLinkType === ''}
                    className='ml-2 min-w-[70%]'
                  />
                  
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => {

                if(selectedLinkType==='')
                  setAddLinkError('Please Select a Link Type');
                else if(selectedLinkType!=='website' && !addLinkURL.includes(selectedLinkType) || !addLinkURL.includes('.'))
                  setAddLinkError('Please enter a valid URL');
                else{
                const newLink = {
                  label:selectedLinkType,url:addLinkURL
                }
                
                setLinks((links)=>(links.filter((link)=>(link.label!==selectedLinkType))));
                setLinks([newLink,
                  ...links]);
                setOpenAddLinkModal(false);
                setAddLinkError(null);
                setSelectedLinkType('');
                setAddLinkURL('');
                }
              }}>Add</Button>
            </Modal.Footer>
         </Modal>

          {links &&
           links.map(link => 
            (<div className='flex items-baseline min-w-[30%] gap-4 my-4' key={Date.now()}>
            <label>{link.label}</label>
            <TextInput
              id={link.label}
              value={link.url}
              onChange={function(){
                setLinks(links.map(
                  linkEntry =>{linkEntry.label!==link.label ? linkEntry : 
                    {label:link.label,url:link.url}}));
              }}
              placeholder={`https://www.${link.label}.com/in/username`}
              className='mt-1 mb-4 w-[80%] md:w-[60%]'
            />
            <Button className='text-red-600 items-center rounded-full'
              onClick={function(){
                setLinks(links.filter(linkEntry => linkEntry.label!==link.label));
              }}
            ><MdDelete/></Button>
            </div>)
           )}

          </div>

         </div>

      <div className='flex justify-center w-full mt-8'>
        <Button className=' outline ' onClick={handleUpdateProfile}>
          {loading ? <Spinner/> : "Update Details"}
        </Button>
      </div>
     

      </div>


    </div>
  )
}

export default ProfileSetting
