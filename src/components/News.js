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
        try {
            props.setprogress(0);

            let url = `https://gnews.io/api/v4/top-headlines?category=${props.category}&lang=en&country=${props.country}&max=${props.pageSize}&apikey=${props.apiKey}`;

            setLoading(true);

            let data = await fetch(url);

            props.setprogress(30);

            let parsadata = await data.json();

            props.setprogress(70);

            console.log(parsadata);

            // Safe handling for API errors
            if (parsadata.articles) {
                setArticles(parsadata.articles);
                setTotalResults(parsadata.totalArticles || parsadata.articles.length);
            } else {
                setArticles([]);
                setTotalResults(0);
            }

            setLoading(false);

            props.setprogress(100);

        } catch (error) {
            console.log("Error fetching news:", error);

            setArticles([]);
            setLoading(false);
        }
    }

    useEffect(() => {
        document.title = `NewsMonkey | ${capitalizeFirstLetter(props.category)} `;
        newupdate();

        // eslint-disable-next-line
    }, [])

    const fetchMoreData = async () => {

        try {
            const nextPage = page + 1;
            setPage(nextPage);

            let url = `https://gnews.io/api/v4/top-headlines?category=${props.category}&lang=en&country=${props.country}&max=${props.pageSize}&page=${nextPage}&apikey=${props.apiKey}`;

            setLoading(true);

            let data = await fetch(url);

            let parsadata = await data.json();

            console.log(parsadata);

            if (parsadata.articles) {
                setArticles((prevArticles) =>
                    prevArticles.concat(parsadata.articles)
                );

                setTotalResults(
                    parsadata.totalArticles || articles.length + parsadata.articles.length
                );
            }

            setLoading(false);

        } catch (error) {
            console.log("Error fetching more news:", error);
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className='text-center' style={{ marginTop: '90px', marginBottom: '30px' }}>
                NewsMonkey Top-{capitalizeFirstLetter(props.category)} Headlines
            </h1>

            <div className='text-center text-dark'>
                {loading && <Spinner />}
            </div>

            <InfiniteScroll
                dataLength={articles?.length || 0}
                next={fetchMoreData}
                hasMore={(articles?.length || 0) < totalResults}
                loader={<div className='text-center'><Spinner /></div>}
            >
                <div className='container'>
                    <div className='row my-3'>

                        {articles && articles.map((elements, index) => {

                            return (
                                <div
                                    className='col-12 col-sm-6 col-md-4 my-3'
                                    key={elements.url ? elements.url + index : index}
                                >

                                    <Newsitem
                                        title={elements.title ? elements.title : ""}
                                        description={elements.description ? elements.description : ""}
                                        urlToImage={elements.image ? elements.image : ""}
                                        url={elements.url}
                                        author={elements.source?.name ? elements.source.name : "Unknown"}
                                        publishedAt={elements.publishedAt}
                                        source={elements.source?.name ? elements.source.name : "Unknown"}
                                    />

                                </div>
                            )
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