import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';

// Components
import PostCard from '../../components/PostCard';
import StoryCarousel from '../../components/StoryCarousel';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

// Services
import {postService} from '../../services/postService';
import {socketService} from '../../services/socketService';

// Context
import {useAuth} from '../../context/AuthContext';
import {useSocket} from '../../context/SocketContext';

const {width, height} = Dimensions.get('window');

const HomeScreen = ({navigation}) => {
  const {user} = useAuth();
  const {socket, isConnected} = useSocket();
  const insets = useSafeAreaInsets();
  
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadInitialData();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [postsData, storiesData] = await Promise.all([
        postService.getFeedPosts(1),
        postService.getStories()
      ]);
      
      setPosts(postsData.posts || []);
      setStories(storiesData.stories || []);
      setHasMore(postsData.hasMore || false);
      setPage(2);
    } catch (error) {
      console.error('Error loading feed:', error);
      Alert.alert('Error', 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('new_post', handleNewPost);
      socket.on('post_liked', handlePostLiked);
      socket.on('post_commented', handlePostCommented);
      socket.on('story_added', handleNewStory);
    }
  };

  const cleanupSocketListeners = () => {
    if (socket) {
      socket.off('new_post', handleNewPost);
      socket.off('post_liked', handlePostLiked);
      socket.off('post_commented', handlePostCommented);
      socket.off('story_added', handleNewStory);
    }
  };

  const handleNewPost = useCallback((newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    HapticFeedback.trigger('impactLight');
  }, []);

  const handlePostLiked = useCallback((data) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === data.postId
          ? {...post, likes: data.likes, isLiked: data.isLiked}
          : post
      )
    );
  }, []);

  const handlePostCommented = useCallback((data) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === data.postId
          ? {...post, commentsCount: data.commentsCount}
          : post
      )
    );
  }, []);

  const handleNewStory = useCallback((newStory) => {
    setStories(prevStories => [newStory, ...prevStories]);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    HapticFeedback.trigger('impactLight');
    
    try {
      const [postsData, storiesData] = await Promise.all([
        postService.getFeedPosts(1),
        postService.getStories()
      ]);
      
      setPosts(postsData.posts || []);
      setStories(storiesData.stories || []);
      setHasMore(postsData.hasMore || false);
      setPage(2);
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const postsData = await postService.getFeedPosts(page);
      if (postsData.posts && postsData.posts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...postsData.posts]);
        setHasMore(postsData.hasMore);
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const opacity = offsetY > 50 ? 0.9 : 1;
        
        Animated.timing(headerOpacity, {
          toValue: opacity,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    }
  );

  const navigateToChat = () => {
    HapticFeedback.trigger('impactLight');
    navigation.navigate('Activity', {screen: 'ChatList'});
  };

  const navigateToCamera = () => {
    HapticFeedback.trigger('impactLight');
    navigation.navigate('Camera');
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, {opacity: headerOpacity}]}>
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
        style={styles.headerGradient}
      >
        <View style={[styles.headerContent, {paddingTop: insets.top + 10}]}>
          <Animatable.View animation="fadeInLeft" delay={300}>
            <Text style={styles.headerTitle}>Instagram Clone</Text>
          </Animatable.View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={navigateToCamera}
              activeOpacity={0.7}
            >
              <Icon name="add-box" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={navigateToChat}
              activeOpacity={0.7}
            >
              <Icon name="chat" size={26} color="#fff" />
              {/* Notification badge can be added here */}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStories = () => (
    <Animatable.View animation="slideInDown" delay={500}>
      <StoryCarousel
        stories={stories}
        currentUser={user}
        onStoryPress={(story) => {
          // Navigate to story viewer
          navigation.navigate('StoryViewer', {story});
        }}
        onAddStory={() => {
          navigation.navigate('Camera', {mode: 'story'});
        }}
      />
    </Animatable.View>
  );

  const renderPost = ({item, index}) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.postContainer}
    >
      <PostCard
        post={item}
        onLike={() => handleLikePost(item._id)}
        onComment={() => navigation.navigate('PostDetail', {post: item})}
        onShare={() => handleSharePost(item)}
        onUserPress={() => navigation.navigate('Profile', {userId: item.user._id})}
        onPostPress={() => navigation.navigate('PostDetail', {post: item})}
      />
    </Animatable.View>
  );

  const handleLikePost = async (postId) => {
    try {
      HapticFeedback.trigger('impactLight');
      const result = await postService.likePost(postId);
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {...post, likes: result.likes, isLiked: result.isLiked}
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSharePost = (post) => {
    // Implement share functionality
    HapticFeedback.trigger('impactLight');
    Alert.alert('Share Post', 'Share functionality will be implemented here');
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="photo-camera"
      title="No Posts Yet"
      message="Follow some users to see their posts in your feed"
      actionText="Discover People"
      onActionPress={() => navigation.navigate('Search')}
    />
  );

  const keyExtractor = useCallback((item) => item._id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {renderHeader()}
      
      <Animated.FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ListHeaderComponent={renderStories}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E1306C', '#F77737']}
            tintColor="#E1306C"
            progressBackgroundColor="#fff"
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          posts.length === 0 && styles.emptyListContent
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
        getItemLayout={(data, index) => ({
          length: 500, // Approximate post height
          offset: 500 * index,
          index,
        })}
      />
      
      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Offline</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    padding: 5,
  },
  flatListContent: {
    paddingTop: 120, // Account for header
    paddingBottom: 100, // Account for tab bar
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  postContainer: {
    marginBottom: 10,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  connectionStatus: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;