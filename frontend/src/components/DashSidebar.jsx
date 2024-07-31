import { Sidebar } from 'flowbite-react';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
} from 'react-icons/hi';
import{MdAnalytics, MdOutlineWork} from 'react-icons/md'
import {IoMdSettings} from 'react-icons/io'
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logoutSuccess } from '../redux/User/userSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleSignout = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/users/logout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(logoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Sidebar className='hidden md:inline-block md:w-56 md:mr-4 shadow-md shadow-gray-300'>
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>
          <Link to='/dashboard?tab=profile'>
            <Sidebar.Item
              active={tab === 'profile'}
              icon={HiUser}
              label='User'
              labelColor='dark'
              as='div'
            >
              Profile
            </Sidebar.Item>
          </Link>
          
          <Link to='/dashboard?tab=analytics'>
              <Sidebar.Item
                active={tab === 'analytics'}
                icon={MdAnalytics}
                as='div'
              >
                Analytics
              </Sidebar.Item>
            </Link>

            <Link to='/dashboard?tab=posts'>
              <Sidebar.Item
                active={tab === 'posts'}
                icon={HiDocumentText}
                as='div'
              >
                Manage Posts
              </Sidebar.Item>
            </Link>
          
         
            <>
            <Link to='/settings'>
                <Sidebar.Item
                  active={tab === ''}
                  icon={IoMdSettings}
                  as='div'
                >
                  Manage Account
                </Sidebar.Item>
              </Link>

              <Link to='/settings?tab=subscription'>
                <Sidebar.Item
                  active={tab === 'subscription'}
                  icon={MdOutlineWork}
                  as='div'
                >
                  Subscription
                </Sidebar.Item>
              </Link>
            </>
          
          <Sidebar.Item
            icon={HiArrowSmRight}
            className='cursor-pointer hover:text-red-600'
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}