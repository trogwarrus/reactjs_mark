import React from 'react';
import './App.css';

class AddButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id: Math.floor(Date.now()), title: 'Заголовок заметки ', text: 'Текст заметки'};

        this.onCreateMark = this.onCreateMark.bind(this);
    }

    onCreateMark() {

        let newId = Math.floor(Date.now());
        this.setState({id: newId});

        localStorage.setItem('mark' + this.state.id, JSON.stringify(this.state));
        this.props.onAddMark();
    };


    render() {
        return <button className='main-area__button' onClick={this.onCreateMark}>{this.props.children}</button>
    }
}

class EditButton extends React.Component {
    constructor(props) {
        super(props);

        this.onEditEnable = this.onEditEnable.bind(this);
    }

    onEditEnable() {
        this.props.onEditEnable();
    }

    render() {
        return <button className='main-area__button' onClick={this.onEditEnable}
                       style={this.props.style ? this.props.style : null}>{this.props.children}</button>
    }
}

class DeleteButton extends React.Component {
    constructor(props) {
        super(props);

        this.onDeleteMark = this.onDeleteMark.bind(this);
    }

    onDeleteMark(e) {
        e.stopPropagation();
        localStorage.removeItem('mark' + this.props.markId);
        this.props.onDeleteMark();
    }

    render() {
        if (this.props.type === 'normal') {
            return <button className='main-area__button' onClick={this.onDeleteMark}>{this.props.children}</button>
        } else if (this.props.type === 'mark') {
            return (
                <div className='mark-container__delete-container'>
                    <div className='delete-container__delete' onClick={this.onDeleteMark}>
                        Удалить
                    </div>
                </div>
            )
        }
    }
}

class MarkButton extends React.Component {
    constructor(props) {
        super(props);

        this.onSelectMark = this.onSelectMark.bind(this);
    }

    onSelectMark(e) {
        e.stopPropagation();
        const mark = JSON.parse(localStorage.getItem('mark' + this.props.mark.id));
        this.props.onChangeMark(mark.id, mark.title, mark.text);
    };

    render() {
        return (
            <div className='mark-container__mark' onClick={this.onSelectMark}>
                <div className='mark-container__title'>
                    <div className='mark-container__title-text'>
                        {this.props.mark.title}
                    </div>
                    <div className='mark-container__text'>
                        {this.props.mark.text.substr(0, 80)}
                    </div>
                </div>
                <DeleteButton type={'mark'} markId={this.props.mark.id} onDeleteMark={this.props.onDeleteMark}/>

            </div>
        )
    }
}

class EditArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            text: '',
            currentId: 0,
            xPos: 0,
            yPos: 0,
            xPosGlobal: 0,
            yPosGlobal: 0,
            caretPos: 0,
            caretSet: false,
            selector: ''
        };

        this.onTextChange = this.onTextChange.bind(this);
        this.onTextClick = this.onTextClick.bind(this);
        this.onEdit = this.onEdit.bind(this);
    }

    onTextChange(e) {
        let editNow = [e.target.name][0],
            otherInput = [e.target.name][0],
            defaultValue = '';
        if (editNow === 'title') {
            otherInput = 'text';
            defaultValue = this.props.text;
        } else {
            otherInput = 'title';
            defaultValue = this.props.title;
        }
        if (this.state.currentId !== this.props.markId) {
            this.setState({[otherInput]: defaultValue, currentId: this.props.markId});
        }
        this.setState({[editNow]: e.target.value});
        let mark = JSON.parse(localStorage.getItem('mark' + this.props.markId));
        mark[editNow] = e.target.value;
        localStorage.setItem('mark' + this.props.markId, JSON.stringify(mark));
        this.props.onEditMark();
    }

    onTextClick(e) {
        let range = window.getSelection().getRangeAt(0);
        let preCaret = range.cloneRange();
        preCaret.selectNodeContents(e.target);
        preCaret.setEnd(range.endContainer, range.endOffset);
        let caret = preCaret.toString().length;

        let selector = range.endContainer.parentElement.className;

        let rect = e.target.getBoundingClientRect();
        this.setState({
            xPos: e.clientX - rect.left, yPos: e.clientY - rect.top,
            xPosGlobal: e.clientX, yPosGlobal: e.clientY,
            caretPos: caret, selector: selector
        });
        this.props.onShowEdit();
    }

    onEdit() {
        this.setState({caretSet: false})
        this.props.onEditEnable();
    }

    componentDidUpdate() {
        if (this.props.editEnable && !this.state.caretSet && this.state.selector !== '') {
            this.setState({caretSet: true});
            document.getElementsByClassName(this.state.selector + '-edit')[0].focus();
            document.getElementsByClassName(this.state.selector + '-edit')[0].selectionStart = this.state.caretPos;
        }
    }

    render() {
        return (
            !this.props.editEnable ? (
                <div className='main_area__edit-container'>
                    <div className='edit-container__title' onClick={this.onTextClick}>
                        {this.props.title}
                    </div>
                    <div className='edit-container__text' onClick={this.onTextClick}
                         dangerouslySetInnerHTML={{__html: this.props.text.replace(/\n/g, '<br/>')}}>
                    </div>
                    {this.props.showEdit ? (
                        <EditButton onEditEnable={this.onEdit} markId={this.props.markId}
                                    style={{
                                        position: 'absolute',
                                        left: this.state.xPos - 50,
                                        top: this.state.yPos + 10
                                    }}>
                            Редактировать
                        </EditButton>
                    ) : null
                    }
                </div>
            ) : (
                <div className='main_area__edit-container'>
                    <input className='edit-container__title-edit' type="text" name="title"
                           placeholder="Заголовок заметки"
                           value={this.state.currentId !== this.props.markId ? this.props.title : this.state.title}
                           onChange={this.onTextChange}/>
                    <textarea className='edit-container__text-edit' type="text" name="text"
                              placeholder="Текст заметки"
                              value={this.state.currentId !== this.props.markId ? (this.props.text) : this.state.text}
                              onChange={this.onTextChange}/>
                </div>
            )
        )
    }
}


class SearchForm
    extends React
        .Component {
    constructor(props) {
        super(props);
        this.state = {word: '', searchd: []};

        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.levenshteinDistance = this.levenshteinDistance.bind(this);
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        let matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }

        return matrix[b.length][a.length];
    };

    onChangeSearch(event) {
        this.setState({word: event.target.value});
        if (event.target.value.length === 0) {
            this.props.onSearchMark([], false);
            return;
        }
        const titleArray = this.props.mark;
        this.setState({searchd: []});
        for (let i = 0; i < titleArray.length; i++) {
            let keyWord = titleArray[i].title.split(' ');
            for (let j = 0; j < keyWord.length; j++) {
                if (keyWord[j].toLowerCase().indexOf(event.target.value.toLowerCase()) !== -1) {
                    this.setState(prevState => ({
                        searchd: [...prevState.searchd, titleArray[i]]
                    }))
                } else if (this.levenshteinDistance(event.target.value.toLowerCase(), keyWord[j].toLowerCase()) < keyWord[j].length - 3) {
                    this.setState(prevState => ({
                        searchd: [...prevState.searchd, titleArray[i]]
                    }))
                }

            }
        }
        const uniqueNames = this.state.searchd.filter((val, id, array) => array.indexOf(val) === id);
        this.props.onSearchMark(uniqueNames, true);

    }

    render() {
        return <input type="text" className="main-area__input" placeholder="Поиск..."
                      value={this.state.word}
                      onChange={this.onChangeSearch}/>
    }
}

class SortForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sort: localStorage.getItem("sort") == null ? 'desc' : localStorage.getItem("sort"),
            showDropdown: false
        };

        this.onChangeSelect = this.onChangeSelect.bind(this);
        this.onOpenDropDown = this.onOpenDropDown.bind(this);
    }

    onChangeSelect(event) {
        let sort = event.target.getAttribute('value');
        this.props.onChangeSortMark(sort);
        localStorage.setItem('sort', sort);

        this.setState({sort: sort});
    }

    onOpenDropDown() {
        this.setState({showDropdown: !this.state.showDropdown});
    }

    render() {
        return (
            <div className="main-area__select-container">
                <div className="select-container__select-label">
                    Сортировать по:
                </div>
                <div className="select-container__select-button" onClick={this.onOpenDropDown}>
                    {this.state.sort === 'desc' ? ('убыванию даты') : ('возрастанию даты')}
                    {this.state.showDropdown ? (
                        <div className="select-container__dropdown">
                            <div className="select-container__dropdown-button" onClick={this.onChangeSelect}
                                 value="desc">
                                убыванию даты
                            </div>
                            <div className="select-container__dropdown-button" onClick={this.onChangeSelect}
                                 value="asc">
                                возрастанию даты
                            </div>
                        </div>
                    ) : null
                    }
                </div>
            </div>
        )
    }
}

class Area extends React.Component {
    render() {
        return (
            <div className="main-area">
                <div className="main-area__left">
                    <div className="main-area__controls-left">
                        {this.props.addButton}
                        {this.props.searchForm}
                        {this.props.sortForm}
                    </div>
                    {this.props.getList}
                </div>
                {this.props.editShow ? (
                    <div className="main-area__right">
                        <div className="main-area__controls-right">
                            {this.props.editButton}
                            {this.props.deleteButton}
                        </div>
                        {this.props.editArea}
                    </div>
                ) : null
                }
            </div>
        )
    }
}

class GetList extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeMark = this.onChangeMark.bind(this);
    }

    onChangeMark(id, title, text) {
        this.props.onChangeActiveMark(id, title, text);
    }

    render() {
        const marks = this.props.mark.map((mark) => {
            return <MarkButton key={mark.id} mark={mark} onChangeMark={this.onChangeMark}
                               onDeleteMark={this.props.onDeleteMark}/>
        });
        return (<div className="main-area__mark-container">{marks}</div>);
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0, title: '', text: '', mark: [], searchd: [],
            sort: localStorage.getItem("sort") == null ? 'desc' : localStorage.getItem("sort"),
            loaded: false, changed: false, filtered: false, editShow: false, editEnable: false, showEdit: false
        };

        this.onChangeMark = this.onChangeMark.bind(this);
        this.onChangeActiveMark = this.onChangeActiveMark.bind(this);
        this.onChangeSortMark = this.onChangeSortMark.bind(this);
        this.onSearchMark = this.onSearchMark.bind(this);
        this.onEditEnable = this.onEditEnable.bind(this);
        this.onEditMark = this.onEditMark.bind(this);
        this.onShowEdit = this.onShowEdit.bind(this);
        this.loadLocalStorage = this.loadLocalStorage.bind(this);
    }

    onChangeMark() {
        this.setState({changed: true, editShow: false, editEnable: false, showEdit: false});
    }

    onChangeActiveMark(id, title, text) {
        this.setState({id: id, title: title, text: text, editShow: true, editEnable: false, showEdit: false});
    }

    onChangeSortMark(sort) {
        this.setState({changed: true, sort: sort});
    }

    onSearchMark(searchd, filtered) {
        this.setState({searchd: searchd, filtered: filtered});
    }

    onEditEnable() {
        this.setState({editEnable: true})
    }

    onShowEdit() {
        this.setState({showEdit: true})
    }

    onEditMark() {
        this.setState({changed: true});
    }

    componentDidMount() {
        if (!this.state.loaded) {
            this.loadLocalStorage();
        }
    }

    componentDidUpdate() {
        if (this.state.changed) {
            this.loadLocalStorage();
            if (this.state.filtered) {
                this.sortRenderedMark(this.state.searchd, this.state.filtered);
            }
        }
    }

    loadLocalStorage() {
        let marksArray = [];
        for (this.mark in localStorage) {
            if (this.mark.indexOf('mark') !== -1) {
                marksArray.push(JSON.parse(localStorage[this.mark]));
            }

        }
        this.sortRenderedMark(marksArray, false)
        this.setState({mark: marksArray});
        this.setState({loaded: true});
    }

    sortRenderedMark(marksArray, filtered) {
        if (this.state.sort === 'desc') {
            marksArray = marksArray.sort((a, b) => b.id - a.id);
        } else {
            marksArray = marksArray.sort((a, b) => a.id - b.id);
        }
        if (!filtered) {
            this.setState({mark: marksArray});
        } else {
            this.setState({searchd: marksArray});
        }
        this.setState({changed: false});
    }

    render() {
        let addButton = (<AddButton onAddMark={this.onChangeMark}>+ Заметка</AddButton>);
        let editButton = (
            <EditButton onEditEnable={this.onEditEnable} markId={this.state.id}>Редактировать</EditButton>);
        let deleteButton = (<DeleteButton type={'normal'} onDeleteMark={this.onChangeMark}
                                          markId={this.state.id}>Удалить</DeleteButton>);
        let searchForm = (<SearchForm onSearchMark={this.onSearchMark} mark={this.state.mark}/>);
        let sortForm = (<SortForm onChangeSortMark={this.onChangeSortMark} sort={this.state.sort}/>);
        let getList = (<GetList onChangeActiveMark={this.onChangeActiveMark} onDeleteMark={this.onChangeMark}
                                sort={this.state.sort}
                                mark={this.state.filtered ? this.state.searchd : this.state.mark}/>);
        let editArea = (<EditArea title={this.state.title} text={this.state.text}
                                  markId={this.state.id} editEnable={this.state.editEnable}
                                  showEdit={this.state.showEdit}
                                  onEditMark={this.onEditMark} onEditEnable={this.onEditEnable}
                                  onShowEdit={this.onShowEdit}/>);
        return (
            <Area
                addButton={addButton}
                editButton={editButton}
                deleteButton={deleteButton}
                searchForm={searchForm}
                sortForm={sortForm}
                getList={getList}
                editArea={editArea}
                editShow={this.state.editShow}
            />
        )
    }
}

export default App;
