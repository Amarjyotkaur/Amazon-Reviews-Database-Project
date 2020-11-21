fpath = "C:/Users/phang/Desktop/single_note.pkl"
import pickle
infile = open(fpath,'rb')
new_dict = pickle.load(infile)
infile.close()

print(new_dict)