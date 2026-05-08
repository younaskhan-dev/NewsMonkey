import React from 'react'
import './Newsitem.css'

const Newsitem = (props) => {
    let { title, description, urlToImage, url, author, publishedAt, source } = props
    return (
        <div className="h-100">
            <div className="card h-100 shadow-sm">
                <span className="news-badge">{source}</span>
                <img src={urlToImage && urlToImage.startsWith('http') ? urlToImage : 'https://platform.bigblueview.com/wp-content/uploads/sites/27/2025/09/imagn-27196262.jpg?quality=90&strip=all&crop=0%2C10.732984293194%2C100%2C78.534031413613&w=1200'} alt="news" style={{ height: "200px", objectFit: "cover", width: "100%" }} />

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">{description}</p>
                    <p className="card-text mt-auto"><small className="text-muted">By {author} on {new Date(publishedAt).toUTCString()}</small></p>
                    <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark">Read More</a>
                </div>
            </div>
        </div >
    )
}
export default Newsitem
