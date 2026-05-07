import React, { useEffect, useState } from 'react'
import Newsitem from './Newsitem'
import Spinner from './Spinner'
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";

const News = (props) => {

    const capitalizeFirstLetter = (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)

    const newupdate = async () => {
        props.setprogress(0);
        let url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apikey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
        setLoading(true);
        let data = await fetch(url);
        props.setprogress(30);
        let parsadata = await data.json()
        props.setprogress(70);
        console.log(parsadata)
        setArticles(parsadata.articles)
        setTotalResults(parsadata.totalResults)
        setLoading(false)
        props.setprogress(100);
    }
    useEffect(() => {
        document.title = `NewsMonkey | ${capitalizeFirstLetter(props.category)} `
        newupdate()
        // eslint-disable-next-line
    }, [])

    const fetchMoreData = async () => {
        setPage(page + 1)
        let url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apikey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
        setLoading(true)
        let data = await fetch(url);
        let parsadata = await data.json()
        console.log(parsadata)
        setArticles(articles.concat(parsadata.articles))
        setTotalResults(parsadata.totalResults)
        setLoading(false)

    };
    return (
        <>
            <h1 className='text-center ' style={{ marginTop: '80px' }}>NewsMonkey Top- {capitalizeFirstLetter(props.category)} Headlines</h1>
            <div className='text-center text-dark'>
                {loading && <Spinner />}
            </div>
            <InfiniteScroll
                dataLength={articles.length}
                next={fetchMoreData}
                hasMore={articles.length !== totalResults}
                loader={<div className='text-center'>< Spinner /></div>}
            >
                <div className='container'>
                    <div className='row my-3' >
                        {articles.map((elements, index) => {
                            return <div className='col my-3' key={elements.url ? elements.url + index : index}>
                                <Newsitem title={elements.title ? elements.title : ""} description={elements.description ? elements.description : ""} urlToImage={elements.urlToImage} url={elements.url} author={elements.author} publishedAt={elements.publishedAt} source={elements.source.name} />
                            </div>

                        })}
                    </div>
                </div>
            </InfiniteScroll>

        </>
    )
}
News.defaultProps = {
    country: 'us',
    pageSize: 8,
    category: 'general'
}
News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
}

export default News
