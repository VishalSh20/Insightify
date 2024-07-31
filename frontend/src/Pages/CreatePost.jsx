import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PostArticle from '../components/PostArticle';
import PostVideo from '../components/PostVideo';

function CreatePost() {
  const {postType} = useParams();
  console.log(postType);

  return (
    <div>
        {postType === 'video' && <PostVideo/> }
        {postType === '' || postType==='article' && <PostArticle/>}
    </div>
  )
}

export default CreatePost
