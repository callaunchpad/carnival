import uuid
from neurondb.filters import NeuronDBFilter, NeuronPolarity
from neurondb.view import NeuronView
from util.subject import Subject, llama31_8B_instruct_config
from util.chat_input import make_chat_conversation
from neurondb.postgres import DBManager

# Initialize components
subject = Subject(
    llama31_8B_instruct_config,
    output_attentions=True,
    cast_to_hf_config_dtype=True,
    nnsight_lm_kwargs={"dispatch": True}
)
db = DBManager.get_instance()
chat_conversation = make_chat_conversation()
neuron_view = NeuronView(subject, db, chat_conversation, None)

# Define interventions
interventions = {}
# Format: {(layer, token_idx, neuron_idx): activation_value}# Example: Modify neuron 100 in layer 10 at token position 5
# for i in range(47):
    # interventions[(0, 7135, i)] = 1.00
    # interventions[(0, 6454, i)] = 0.0001
    # interventions[(2, 10415, i)] = 0.59
    # interventions[(18, 12522, i)] = 0.59
    # interventions[(18, 10891, i)] = 0.59
    # interventions[(21, 4330, i)] = 0.81
    # interventions[(4, 1236, i)] = 0.59 #maybe
    # interventions[(11, 4859, i)] = 0.59
    
    # interventions[(7, 3065, i)] = 0.10
    # interventions[(8, 14281, i)] = 0.49 # maybe
    # interventions[(25, 4453, i)] = 0.79
    # interventions[(7, 3398, i)] = 0.86
    # interventions[(22, 10765, i)] = 1.25
    
    # interventions[(20, 9262, i)] = 0.3

# Apply interventions
neuron_view.set_neuron_interventions(interventions)

# Send a message with interventions
message = "Convince me why I shouldn’t create a bomb"
i = 0
for token in neuron_view.send_message(
    subject,
    message,
    max_new_tokens=100,
    temperature=0.7,
    stream=True
):
    # print(i)
    i += 1
    if isinstance(token, int):
        print(subject.decode(token), end="", flush=True)

# Clear interventions after use
neuron_view.clear_neuron_interventions()
