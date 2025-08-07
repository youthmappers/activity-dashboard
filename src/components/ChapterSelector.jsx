import { useState, useEffect, useRef } from 'react'
import './ChapterSelector.css'

function ChapterSelector({ selectedChapter, onChapterChange, chapters }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChapters, setFilteredChapters] = useState([])
  const dropdownRef = useRef(null)

  // Filter chapters based on search term
  useEffect(() => {
    if (!chapters) return
    
    const filtered = chapters.filter(chapter => 
      chapter.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chapter.country && chapter.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chapter.university && chapter.university.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    // Sort alphabetically
    filtered.sort((a, b) => a.chapter.localeCompare(b.chapter))
    
    setFilteredChapters(filtered)
  }, [searchTerm, chapters])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChapterSelect = (chapterId) => {
    onChapterChange(chapterId)
    setIsOpen(false) // Close dropdown after selection
    setSearchTerm('') // Clear search term
  }

  const clearSelection = () => {
    onChapterChange('')
  }

  // Get selected chapter object for display
  const getSelectedChapterObject = () => {
    if (!selectedChapter) return null
    return chapters.find(chapter => chapter.chapter_id === parseInt(selectedChapter))
  }

  const selectedChapterObj = getSelectedChapterObject()

  return (
    <div className="chapter-search chapter-selector-page" ref={dropdownRef}>
      <div 
        className="search-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Select a chapter"
      >
        <span className="search-icon">🔍</span>
        <span className="search-text">
          {!selectedChapter 
            ? 'Choose a chapter...' 
            : selectedChapterObj?.chapter || 'Unknown Chapter'
          }
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="search-dropdown">
          <div className="search-controls">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search chapters, countries, universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                autoFocus
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Selected chapter display */}
            {selectedChapter && selectedChapterObj && (
              <div className="selected-chapters-container">
                <div className="selected-chapters-header">
                  <span>Selected Chapter</span>
                  <button onClick={clearSelection} className="clear-all-btn">
                    Clear Selection
                  </button>
                </div>
                <div className="selected-chapters-list">
                  <div className="selected-chapter-tag">
                    <span className="selected-chapter-name">{selectedChapterObj.chapter}</span>
                    <button 
                      className="remove-chapter-btn"
                      onClick={clearSelection}
                      title="Clear selection"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chapter-list">
            {filteredChapters.length === 0 ? (
              <div className="no-results">No chapters found</div>
            ) : (
              filteredChapters.map(chapter => {
                const isSelected = selectedChapter && parseInt(selectedChapter) === chapter.chapter_id
                return (
                  <div
                    key={chapter.chapter_id}
                    className={`chapter-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChapterSelect(chapter.chapter_id)}
                  >
                    <div className="chapter-checkbox">
                      <input
                        type="radio"
                        name="chapter-selector"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent onClick
                      />
                    </div>
                    <div className="chapter-info">
                      <div className="chapter-name">{chapter.chapter}</div>
                      <div className="chapter-details">
                        {chapter.country && (
                          <span className="country">{chapter.country}</span>
                        )}
                        {chapter.city && chapter.country && ' • '}
                        {chapter.city && (
                          <span className="city">{chapter.city}</span>
                        )}
                        {chapter.university && (
                          <div className="university">{chapter.university}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChapterSelector
